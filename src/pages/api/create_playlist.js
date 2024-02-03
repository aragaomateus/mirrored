const {createPlaylist } = require('../../utils/spotifyAPI');

export default async function handler(req, res) {
    const username = req.query.name
    const playlistName = req.query.playlistName
    const tracks = req.query.tracks.split(',')

    // console.log(tracks)
    // const artistName = req.query.artistName
    // if (!artistName || typeof artistName !== 'string') {
    //     res.status(400).json({ error: 'Invalid URI' });
    //     return;
    // }
    
    // // console.log(artistName)

    try {
        const response = await createPlaylist(username, playlistName, tracks);
        console.log(response)
        res.status(200).json(response['playlistInfo']);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
    
    }