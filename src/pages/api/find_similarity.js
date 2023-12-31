// File: pages/api/find-similarity.js
import { fetchPlaylists, selectPlaylist, fetchAudioFeaturesForPlaylist } from '../../utils/spotifyAPI';

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

// // Function to extract feature vectors from track data
// const extractFeatures = (track) => {
//     // Assuming the normalization range for duration, loudness, and tempo are known
//     // For example, duration in milliseconds, loudness in decibels, and tempo in BPM
//     const durationRange = [0, 1200000]; // e.g., 0 ms to 20 minutes
//     const loudnessRange = [-60, 0]; // e.g., -60 dB to 0 dB
//     const tempoRange = [0, 200]; // e.g., 0 BPM to 200 BPM

//     // Normalization function
//     const normalize = (value, [min, max]) => (value - min) / (max - min);

//     return [
//         track.acousticness,
//         track.danceability,
//         normalize(track.duration_ms, durationRange),
//         track.energy,
//         track.instrumentalness,
//         track.liveness,
//         normalize(track.loudness, loudnessRange),
//         track.speechiness,
//         normalize(track.tempo, tempoRange),
//         track.valence
//     ];
// };

// // Function to calculate average similarity
// const calculateAverageSimilarity = (tracksA, tracksB) => {
//     let totalSimilarity = 0;
//     let count = 0;

//     tracksA.forEach(trackA => {
//         const vecA = extractFeatures(trackA);
//         tracksB.forEach(trackB => {
//             const vecB = extractFeatures(trackB);
//             totalSimilarity += cosineSimilarity(vecA, vecB);
//             count++;
//         });
//     });

//     return count > 0 ? totalSimilarity / count : 0;
// };
// // Function to multiply feature values within a track to generate a score
// const generateScore = (track) => {
//     const features = extractFeatures(track);
//     return features.reduce((acc, feature) => acc * feature, 1);
// };

// // Function to calculate Pearson correlation between two arrays
// const pearsonCorrelation = (arr1, arr2) => {
//     let n = arr1.length;
//     let sum1 = arr1.reduce((acc, val) => acc + val, 0);
//     let sum2 = arr2.reduce((acc, val) => acc + val, 0);

//     let sum1Sq = arr1.reduce((acc, val) => acc + val * val, 0);
//     let sum2Sq = arr2.reduce((acc, val) => acc + val * val, 0);

//     let pSum = arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);

//     let num = pSum - (sum1 * sum2 / n);
//     let den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

//     return den ? num / den : 0;
// };

// // // Function to calculate similarity between two sets of tracks using Pearson correlation
// // const calculateSimilarity = (tracksA, tracksB) => {
// //     const scoresA = tracksA.map(generateScore);
// //     const scoresB = tracksB.map(generateScore);

// //     return pearsonCorrelation(scoresA, scoresB);
// // };

// // Remember to use the same extractFeatures function from before
// const calculateCorrelationMatrix = (tracksA, tracksB) => {
//     const matrix = [];
//     tracksA.forEach((trackA, indexA) => {
//         const vecA = extractFeatures(trackA);
//         matrix[indexA] = [];
//         tracksB.forEach((trackB, indexB) => {
//             const vecB = extractFeatures(trackB);
//             matrix[indexA][indexB] = pearsonCorrelation(vecA, vecB);
//         });
//     });
//     return matrix;
// };

// const calculateCentroid = (tracks) => {
//     const sumVec = tracks.reduce((sum, track) => {
//         const features = extractFeatures(track);
//         return sum.map((val, index) => val + features[index]);
//     }, new Array(extractFeatures(tracks[0]).length).fill(0));
    
//     return sumVec.map(val => val / tracks.length);
// };

// Function to find the min and max values for normalization
// Function to extract raw features from track data
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

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { usernameA, usernameB } = req.query;
    try {
        const playlistsA = await fetchPlaylists(usernameA);
        const playlistsB = await fetchPlaylists(usernameB);
  
        const selectedPlaylistA = selectPlaylist(playlistsA);
        const selectedPlaylistB = selectPlaylist(playlistsB);
        console.log(selectedPlaylistB)
  
        const tracksA = await fetchAudioFeaturesForPlaylist(selectedPlaylistA.uri,30);
        const tracksB = await fetchAudioFeaturesForPlaylist(selectedPlaylistB.uri,30);
  
            // Example usage
        // First, find the min and max values for normalization
        const minMax = findMinMax(tracksA, tracksB);

        // Then, calculate centroids for each set of tracks
        const centroidA = calculateCentroid(tracksA, minMax);
        const centroidB = calculateCentroid(tracksB, minMax);

        // Finally, compute the Euclidean distance between the two centroids
        const distance = cosineSimilarity(centroidA, centroidB);
        
        return res.status(200).json({ success: true, similarity: distance});
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
