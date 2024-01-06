const { getArtistTracks, calculateAverageAudioFeatures, fetchUserPlaylists } = require('./spotifyAPI');

getArtistTracks('1TnNKsMdzxwBiHkde10tPX').then(playlists => {
    console.log(playlists);
});
