const {getArtistTracks,calculateAverageAudioFeatures, getSpotifyRecommendations,fetchArtistId, fetchSpotifyGeneratedPlaylists, fetchUserPlaylists,fetchAudioFeaturesForPlaylist } = require('../../utils/spotifyAPI');
const { spawn } = require('child_process');

const fs = require('fs');
import { fetchJSONData } from '../../utils/fetchJSON';
import { updateJsonInS3 } from '../../utils/updateJSON';


// Helper function to calculate cosine similarity (you'll need to write this part)
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
  
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];  // Sum of the product of each dimension
      magnitudeA += vecA[i] * vecA[i];  // Sum of squares of vector A
      magnitudeB += vecB[i] * vecB[i];  // Sum of squares of vector B
    }
  
    magnitudeA = Math.sqrt(magnitudeA); // Square root of sum of squares (magnitude) for A
    magnitudeB = Math.sqrt(magnitudeB); // Square root of sum of squares (magnitude) for B
  
    if (magnitudeA && magnitudeB) {
      return dotProduct / (magnitudeA * magnitudeB); // Cosine similarity
    } else {
      return 0;
    }
  };
  

  const findMinMax = (data) => {
    let minMax = {};
    for (const features of Object.values(data)) {
        Object.entries(features).forEach(([key, value]) => {
            if (!minMax[key]) {
                minMax[key] = { min: Infinity, max: -Infinity };
            }
            minMax[key].min = Math.min(minMax[key].min, value);
            minMax[key].max = Math.max(minMax[key].max, value);
        });
    }
    return minMax;
};

const normalizeFeatures = (features, minMax) => {
    return Object.fromEntries(Object.entries(features).map(([key, value]) => {
        if (minMax[key].max !== minMax[key].min) {
            return [key, (value - minMax[key].min) / (minMax[key].max - minMax[key].min)];
        }
        return [key, 0]; // Avoid division by zero
    }));
};

const findOpposite = (artistIds, data, n = 5) => {
    let allOpposites = [];
    const minMax = findMinMax(data);

    artistIds.forEach(artistId => {
        if (!artistId || !data[artistId]) {
            console.log(`Invalid or missing data for artistId: '${artistId}'`);
            return;
        }

        const artistFeatures = normalizeFeatures(data[artistId], minMax);
        let distances = [];

        for (const [id, features] of Object.entries(data)) {
            if (id !== artistId) {
                const normalizedFeatures = normalizeFeatures(features, minMax);
                const distance = cosineSimilarity(Object.values(artistFeatures), Object.values(normalizedFeatures));
                distances.push({ id, distance });
            }
        }

        distances.sort((a, b) => a.distance - b.distance);
        allOpposites.push(...distances.slice(0, n).map(item => item.id));
    });

    return allOpposites;
};


// const findOppositeArtists = (file, artistIds, n) => {
// return new Promise((resolve, reject) => {
//     // fs.readFile(filePath, 'utf8', (err, jsonString) => {
//     // if (err) {
//     //     reject("Error reading file: " + err);
//     // } else {
//         try {
//         const data = JSON.parse(file);
//         const opposites = findOpposite(artistIds, data, n);
//         resolve(opposites);
//         } catch (error) {
//         reject('Error parsing JSON: ' + error);
//         }
//     // }
//     // });
// });
// };
function cleanArray(arr) {
    // Create a new Set from the filtered array (removing 'undefined' and duplicates)
    const cleanedSet = new Set(arr.filter(id => id !== 'undefined' && id !== undefined));

    // Convert the Set back to an array
    return Array.from(cleanedSet);
}

  
function calculateCentroid(tracks, features) {
    const centroid = {};
    features.forEach(feature => {
        centroid[feature] = average(tracks.map(track => track[feature]));
    });
    return centroid;
}

function calculateEuclideanDistance(track, centroid, features) {
    return Math.sqrt(
        features.reduce((sum, feature) => sum + Math.pow((track[feature] - centroid[feature]), 2), 0)
    );
}

function average(array) {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
}

async function getOppositePlaylist(ids, centroid, data) {
    const allIdsPresent = ids.every(id => data.hasOwnProperty(id));
    if (!allIdsPresent) {
        // If any ID is missing, update the JSON in S3
        try {
            await updateJsonInS3(ids);
            console.log('JSON data successfully updated in S3');
        } catch (error) {
            console.error('Error updating JSON in S3:', error);
            throw error;
        }
    }else{
        const opposites =cleanArray(findOpposite(ids, data, 5));
        console.log('opposites',opposites)
        const params = {
            target_danceability: 1 - centroid.danceability,
            target_energy: 1 - centroid.energy,
            target_mode: centroid.mode === 0 ? 1 : 0,
            // target_key: centroid.key, // Uncomment if needed
            target_speechiness: 1 - centroid.speechiness,
            target_acousticness: 1 - centroid.acousticness,
            target_instrumentalness: 1 - centroid.instrumentalness,
            target_liveness: 1 - centroid.liveness,
            target_valence: 1 - centroid.valence,
            limit: 20 // Assuming limit is a predefined variable
        };

        // Fetch Spotify recommendations
        const playlistRecommendations = await getSpotifyRecommendations(opposites, params);
        return playlistRecommendations;
    }

}


async function getArtistIds(closestTracks) {
    const artistIdPromises = closestTracks.map(track => 
        fetchArtistId(track.id))
    return await Promise.all(artistIdPromises);
}

async function getOppositePlaylistRecommendations(tracks, limit = 15) {
    const featuresOfInterest = ["id", "danceability", "energy", "key", "loudness", "mode", "speechiness", "acousticness", "instrumentalness", "liveness", "valence", "tempo"];

    // Calculate centroid of the playlist features
    const centroid = calculateCentroid(tracks, featuresOfInterest);

    // Find the distance of each track from the centroid
    tracks.forEach(track => {
        track.distance = calculateEuclideanDistance(track, centroid, featuresOfInterest);
    });

    // Sort tracks by distance and get the closest ones
    const sortedTracks = tracks.sort((a, b) => a.distance - b.distance);
    const closestTracks = sortedTracks.slice(0, 3);

    const packedArtistIds = await getArtistIds(closestTracks)

    const ids = packedArtistIds.map(artist => artist[0].id)


    const jsonData = await fetchJSONData()

    // const jsonData = await response.json();
    const data = JSON.parse(jsonData);

    return getOppositePlaylist(ids, centroid, data) 
}

export default async function handler(req, res) {
    const URI = req.query.uri
    if (!URI || typeof URI !== 'string') {
        res.status(400).json({ error: 'Invalid URI' });
        return;
    }
    
    // console.log(URI)

    try {
        const payload = await fetchAudioFeaturesForPlaylist(URI);
        const recommendations = await getOppositePlaylistRecommendations(payload[0]);
        
        const original = payload[1].items.map(item =>{
            return {
                artist: item.track.artists[0].name,
                name: item.track.name,
                image: item.track.album.images[1].url
            };
        })
        console.log(typeof recommendations)
        res.status(200).json([recommendations,original]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
    
     
    }