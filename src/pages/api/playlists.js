import { fetchSpotifyData, fetchSpotifyGeneratedPlaylists,fetchUserPlaylists } from '../../utils/spotifyAPI'; // Adjust the import path as needed

export default async function handler(req, res) {
  const type = req.query.type
  
  switch(type){

    case 'user': 
      try {
        const username = req.query.username; // Get the username from the query string
        const playlists = await fetchUserPlaylists(username);
        res.status(200).json(playlists);
        break
      } catch (error) {
        console.error('Error fetching generated playlists:', error);
        res.status(500).json({ error: error.message });
      }
    case 'spotify':
      try {
        const username = req.query.username; // Get the username from the query string
        const playlists = await fetchSpotifyGeneratedPlaylists(username);
        res.status(200).json(playlists);
        break
      } catch (error) {
        console.error('Error fetching generated playlists:', error);
        res.status(500).json({ error: error.message });
      }
      
  }
   
  }