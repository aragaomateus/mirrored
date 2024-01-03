const { createSpotifyPlaylist,
    addTracksToSpotifyPlaylist,
    getSpotifyRecommendations} = require('../../utils/spotifyAPI');

export default async function handler(req, res) {
    const username = req.body.username
    const playlistName = req.body.playlistName
    const artistURI = req.body.uris

    if (!playlistName || typeof playlistName !== 'string') {
        res.status(400).json({ error: 'Invalid playlistName' });
        return;
    }

    try {

        // // Step 1: Create the playlist
        // const playlistData = await createSpotifyPlaylist(username, playlistName);
        // console.log('Created playlist:', playlistData);

        // Step 2: Add tracks to the playlist
        // const trackUris = ['spotify:track:4iV5W9uYEdYUVa79Axb7Rh', 'spotify:track:1301WleyT98MSxVHPZCA6M']; // Replace with your tracks URIs
        const recommendations = await getSpotifyRecommendations(artistURI,{limit:30})
        // const trackUris = recommendations.map(rec => rec.uri)

        // const snapshotId = await addTracksToSpotifyPlaylist(playlistData.id, trackUris);
        // console.log('Added tracks, playlist snapshot ID:', snapshotId);

        // Up
        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
    
     
    }