const { getSpotifyRecommendations,fetchArtistId, fetchSpotifyGeneratedPlaylists, fetchUserPlaylists,fetchAudioFeaturesForPlaylist } = require('../../utils/spotifyAPI');
const { spawn } = require('child_process');

  
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



const path = require('path');

async function runPythonScript(artistIds) {
    return new Promise((resolve, reject) => {
        // Construct the path to the Python file
        const pythonFilePath = path.join(__dirname, '../../../../src/pages/api/find_opposite.py');

        const pythonProcess = spawn('python3', [pythonFilePath, JSON.stringify(artistIds)]);

        let scriptOutput = '';
        pythonProcess.stdout.on('data', (data) => {
            scriptOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python script output: ${scriptOutput}`);

            console.log(`Python script exited with code ${code}`);
            if (code === 0) {
                resolve(JSON.parse(scriptOutput));
            } else {
                reject(`Python script exited with code ${code}`);
            }
        });
    });
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
    
    // var oppositeIds = []

    const oppositeIds = await runPythonScript(ids)
    .then(result => {
      // console.log('Result from Python script:', result);
      // You can use 'result' here
      return result
      // console.log(oppositeIds)
    })
    .catch(error => {
      console.error('Error running Python script:', error);
    });
    const params = {
      target_danceability: 1 - centroid.danceability,
      target_energy: 1 - centroid.energy,
      target_mode: centroid.mode === 0 ? 1 : 0,
      // target_key: centroid.key,
      target_speechiness: 1 - centroid.speechiness,
      target_acousticness: 1 - centroid.acousticness,
      target_instrumentalness: 1 - centroid.instrumentalness,
      target_liveness: 1 - centroid.liveness,
      target_valence: 1 - centroid.valence,
      limit: 20 // Assuming limit is a predefined variable
  };

  // Example usage
  // Make sure to pass oppositesSeeds, params, and a valid accessToken
  return getSpotifyRecommendations(oppositeIds,params)
  .then(playlistRecommendations => {
    return playlistRecommendations;
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

export default async function handler(req, res) {
    const URI = req.query.uri
    if (!URI || typeof URI !== 'string') {
        res.status(400).json({ error: 'Invalid URI' });
        return;
    }
    
    console.log(URI)

    try {
        const features = await fetchAudioFeaturesForPlaylist(URI);
        const recommendations = await getOppositePlaylistRecommendations(features);
        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
    
     
    }