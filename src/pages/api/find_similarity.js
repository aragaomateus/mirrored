// File: pages/api/find-similarity.js
import {
    fetchPlaylists,
    getSpotifyUserInfo,
    selectPlaylist,
    fetchAudioFeaturesForPlaylist,
    getMultipleArtistsInfo
} from '../../utils/spotifyAPI';

// // Helper function to calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

const extractFeatures = (track) => {
    return [
        track.acousticness,
        track.danceability,
        track.duration_ms,
        track.energy,
        track.instrumentalness,
        track.liveness,
        track.loudness,
        track.speechiness,
        track.tempo,
        track.valence
    ];
};

// Function to find min and max values for each feature across all tracks
const findMinMax = (tracksA, tracksB) => {
    const combinedTracks = tracksA.concat(tracksB);
    const featuresLength = extractFeatures(combinedTracks[0]).length;
    const minMax = Array(featuresLength).fill().map(() => ({ min: Infinity, max: -Infinity }));

    combinedTracks.forEach(track => {
        const features = extractFeatures(track);
        features.forEach((feature, index) => {
            if (feature < minMax[index].min) minMax[index].min = feature;
            if (feature > minMax[index].max) minMax[index].max = feature;
        });
    });

    return minMax;
};

// Function to normalize features of a track
const normalizeFeatures = (track, minMax) => {
    const features = extractFeatures(track);
    return features.map((feature, index) => {
        const range = minMax[index].max - minMax[index].min;
        return range > 0 ? (feature - minMax[index].min) / range : 0;
    });
};

// Function to calculate the centroid of a set of tracks
const calculateCentroid = (tracks, minMax) => {
    const sumVec = tracks.reduce((sum, track) => {
        const normalizedFeatures = normalizeFeatures(track, minMax);
        return sum.map((val, index) => val + normalizedFeatures[index]);
    }, new Array(extractFeatures(tracks[0]).length).fill(0));

    return sumVec.map(val => val / tracks.length);
};

// Function to calculate Euclidean distance between two vectors
const euclideanDistance = (vecA, vecB) => {
    return Math.sqrt(
        vecA.reduce((sum, val, index) => sum + Math.pow(val - vecB[index], 2), 0)
    );
};

// Example usage
const adjustedSimilarity = (similarity)=>{
    const adjust = similarity - 70
    if (adjust>0){
      return (adjust / 30) *100
    }else{return similarity}
  }

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { usernameA, usernameB } = req.query;
        try {
            const playlistsA = await fetchPlaylists(usernameA);
            const playlistsB = await fetchPlaylists(usernameB);

            const selectedPlaylistA = selectPlaylist(playlistsA);
            const selectedPlaylistB = selectPlaylist(playlistsB);

            const tracksA = await fetchAudioFeaturesForPlaylist(selectedPlaylistA.uri, 30);
            const tracksB = await fetchAudioFeaturesForPlaylist(selectedPlaylistB.uri, 30);

            const listOfIdsA = new Set(tracksA[1].items.map(item => {
                return item.track.album.artists[0].id
            }))

            const listOfIdsB = new Set(tracksB[1].items.map(item => {
                return item.track.album.artists[0].id
            }))
            const genresA = await getMultipleArtistsInfo(Array.from(listOfIdsA))
            const genresB = await getMultipleArtistsInfo(Array.from(listOfIdsB))


            const minMax = findMinMax(tracksA[0], tracksB[0]);

            // Then, calculate centroids for each set of tracks
            const centroidA = calculateCentroid(tracksA[0], minMax);
            const centroidB = calculateCentroid(tracksB[0], minMax);

            // Finally, compute the Euclidean distance between the two centroids
            const distance = cosineSimilarity(centroidA, centroidB);

            const infoA = await getSpotifyUserInfo(usernameA)
            const infoB = await getSpotifyUserInfo(usernameB)

            return res.status(200).json({
                success: true, similarity:adjustedSimilarity(distance *100), users: {
                    userA: {
                        info: infoA,
                        genres: genresA
                    },
                    userB: {
                        info: infoB,
                        genres: genresB
                    }
                }
            });
        } catch (error) {
            console.error('API Error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
        // ... rest of the code remains the same
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
