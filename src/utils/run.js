const { fetchSpotifyData, fetchSpotifyGeneratedPlaylists, fetchUserPlaylists } = require('./spotifyAPI');

fetchUserPlaylists('aragaosm').then(playlists => {
    console.log(playlists);
});
