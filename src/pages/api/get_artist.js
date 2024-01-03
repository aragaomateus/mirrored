const {searchSpotifyArtist } = require('../../utils/spotifyAPI');

export default async function handler(req, res) {
    const artistName = req.query.artistName
    if (!artistName || typeof artistName !== 'string') {
        res.status(400).json({ error: 'Invalid URI' });
        return;
    }
    
    // console.log(artistName)

    try {
        const artist = await searchSpotifyArtist(artistName);
        res.status(200).json(artist);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
    
     
    }