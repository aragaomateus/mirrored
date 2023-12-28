// spotifyAPI.js
const axios = require('axios');
require('dotenv').config();

// Spotify API credentials from environment variables
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN; // Store and use your refresh token

/**
 * Refreshes the Spotify access token using the refresh token.
 * @returns {Promise<string>} A promise that resolves with the new access token.
 */
function refreshAccessToken() {
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            params: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
            },
        })
        .then(response => {
            const newAccessToken = response.data.access_token;
            // console.log('New Access Token:', newAccessToken);
            resolve(newAccessToken);
        })
        .catch(error => {
            console.error('Error refreshing access token:', error);
            reject(error);
        });
    });
}

/**
 * Fetches data about the current user from Spotify.
 * @returns {Promise<object>} A promise that resolves with the user data.
 */
async function fetchSpotifyData() {
    try {
        const accessToken = await refreshAccessToken(); // Await the new access token
        const apiUrl = 'https://api.spotify.com/v1/me'; // Example endpoint

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

/**
 * Fetches Spotify's generated playlists for a specified user.
 * @param {string} username - Spotify username to fetch playlists for.
 * @returns {Promise<object[]>} A promise that resolves with an array of playlist details.
 */
async function fetchSpotifyGeneratedPlaylists(username) {
    const accessToken = await refreshAccessToken();

    let offset = 0;
    const limit = 50; // Maximum allowed by Spotify
    const generatedPlaylists = ["Discover Weekly", "Daily Mix 1", "Daily Mix 2", "Daily Mix 3", "Daily Mix 4", "Daily Mix 5", "Daily Mix 6"];
    let playlistDetails = [];

    while (true) {
        const endpoint = `https://api.spotify.com/v1/users/${username}/playlists`;
        const response = await fetch(`${endpoint}?limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const playlistsData = await response.json();

        if (!playlistsData.items || playlistsData.items.length === 0) {
            break;
        }

        const matchingPlaylists = playlistsData.items
            .filter(playlist => generatedPlaylists.some(name => playlist.name.includes(name)))
            .map(playlist => ({
                name: playlist.name,
                uri: playlist.uri,
                description: playlist.description || null,
                owner: playlist.owner.display_name,
                imageUrl: playlist.images.length > 0 ? playlist.images[0].url : null
            }));

        playlistDetails = playlistDetails.concat(matchingPlaylists);
        offset += limit;
    }

    return playlistDetails;
}

/**
 * Fetches all playlists created by a specific user on Spotify.
 * @param {string} username - Spotify username to fetch playlists for.
 * @returns {Promise<object[]>} A promise that resolves with an array of playlist details.
 */
async function fetchUserPlaylists(username) {
    const accessToken = await refreshAccessToken();

    let offset = 0;
    const limit = 50; // Maximum number of playlists retrievable in one request
    let playlists = [];

    while (true) {
        const endpoint = `https://api.spotify.com/v1/users/${username}/playlists`;
        const response = await fetch(`${endpoint}?limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const playlistsData = await response.json();

        if (!playlistsData.items || playlistsData.items.length === 0) {
            break;
        }

        playlistsData.items.forEach(playlist => {
            if (playlist.owner.id == username) { // Filtering playlists owned by the user
                playlists.push({
                    name: playlist.name,
                    uri: playlist.uri,
                    description: playlist.description || null,
                    imageUrl: playlist.images.length > 0 ? playlist.images[0].url : null,
                    public: playlist.public,
                    totalTracks: playlist.tracks.total,
                    username: username,
                    owner: playlist.owner.id
                });
            }
        });

        offset += limit;
    }

    return playlists;
}

// Exporting the functions to be used in other files
module.exports = {
    fetchSpotifyData,
    fetchSpotifyGeneratedPlaylists,
    fetchUserPlaylists,
    refreshAccessToken
};
