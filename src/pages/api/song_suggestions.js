const { 
    getSpotifyRecommendations} = require('../../utils/spotifyAPI');

export default async function handler(req, res) {
    const playlistName = req.body.playlistName
    const artistURI = req.body.uris

    if (!playlistName || typeof playlistName !== 'string') {
        res.status(400).json({ error: 'Invalid playlistName' });
        return;
    }

    try {

        const recommendations = await getSpotifyRecommendations(artistURI,{limit:30})
        console.log(recommendations)
        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
    
     
    }