const {getSpotifyUserInfo,searchSpotifyArtist } = require('../../utils/spotifyAPI');

export default async function handler(req, res) {
    const username = req.query.username
    if (!username || typeof username !== 'string') {
        res.status(400).json({ error: 'Invalid URI' });
        return;
    }
    

    try {
        const artistUri = await getSpotifyUserInfo(username);
        res.status(200).json(artistUri);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
    
     
    }