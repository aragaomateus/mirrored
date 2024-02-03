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
async function getAudioFeaturesForTracks(trackIds) {
    const accessToken = await refreshAccessToken();

    const ids = trackIds.join(',');
    const limit = 50; // or whatever number suits your needs
    const offset = 0;

    const endpoint = `https://api.spotify.com/v1/audio-features?limit=${limit}&offset=${offset}&ids=${ids}`;

    const response = await fetch(endpoint, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error fetching audio features: ${response.statusText}`);
    }

    const data = await response.json();
    return data.audio_features;
}

async function fetchAudioFeaturesForPlaylist(playlistURI, numberOfTracks = null) {
    const accessToken = await refreshAccessToken();
    const playlistId = playlistURI.split(':')[2];

    const limit = numberOfTracks || 50;  // If numberOfTracks is provided, use it, otherwise default to 50
    const offset = 0;

    try {
        const endpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        const response = await fetch(`${endpoint}?limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const playlistsData = await response.json();
        if (!playlistsData || !playlistsData.items) {
            console.log(`Couldn't fetch tracks for playlist ID: ${playlistId}. Skipping.`);
            return [];
        }

        const trackIds = playlistsData.items.map(item => item.track.id);
        const featuresList = await getAudioFeaturesForTracks(trackIds);

        return [featuresList,playlistsData];
    } catch (error) {
        console.error(`Error fetching audio features for playlist: ${error}`);
        return [];
    }
}


async function fetchArtistId(trackId) {
    const accessToken = await refreshAccessToken();

    // Extracting the playlist ID from the full URI
    
    // Constructing the endpoint to fetch tracks from the playlist
    const limit = 50; // or whatever number suits your needs
    const offset = 0;
    try {
        const endpoint = `https://api.spotify.com/v1/tracks/${trackId}`;
        const response = await fetch(`${endpoint}?limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (!data || !data.artists) {
            console.log(`Couldn't fetch tracks for playlist ID: ${trackId}. Skipping.`);
            return [];
        }

        return data.artists;
    } catch (error) {
        console.error(`Error fetching audio features for playlist: ${error}`);
        return [];
    }
}
function getRandomIds(ids, count = 6) {
    // Shuffle the array
    const shuffledIds = ids.sort(() => 0.5 - Math.random());

    // Get the first 'count' elements
    return shuffledIds.slice(0, count);
}

async function getSpotifyRecommendations(oppositesSeeds, params) {
    const accessToken = await refreshAccessToken();
    const queryParams = new URLSearchParams({
        seed_artists: getRandomIds(oppositesSeeds,5).map(id => id.trim()).join(','),
        ...params, // Spread the other parameters like target_danceability, target_energy, etc.
    }).toString();

    const endpoint = `https://api.spotify.com/v1/recommendations?${queryParams}`;

    try {
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // or response.json() if response returns JSON
            console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, details: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // data.tracks.forEach(track=>{
        //     console.log(track.name);
        //     console.log(track.album.images);
        // });
        return data.tracks.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            popularity: track.popularity,
            uri: track.uri,
            album_cover : track.album.images[1].url
        }));

    } catch (error) {
        console.error(`Error fetching recommendations: ${error}`);
        return [];
    }
}

const selectPlaylist = (playlists) => {
    const discoverWeekly = playlists.find(playlist => playlist.name === 'Discover Weekly');
    if (discoverWeekly) return discoverWeekly;
  
    return playlists.reduce((largest, playlist) => {
      return (largest.totalTracks > playlist.totalTracks) ? largest : playlist;
    });
  };
async function fetchPlaylists(username) {
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
        });

        offset += limit;
    }

    return playlists;
}
async function getSpotifyUserInfo(username) {
    const accessToken = await refreshAccessToken();


    try {
      const response = await fetch(`https://api.spotify.com/v1/users/${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
  
      const userInfo = await response.json();
      return userInfo; // This contains the user profile information
    } catch (error) {
      console.error('Failed to retrieve user information from Spotify:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  }
  const searchSpotifyArtist = async (artistName) => {
    const accessToken = await refreshAccessToken();

    const query = encodeURIComponent(`artist:${artistName}`);
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=artist`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  
    const data = await response.json();
    if (data.artists && data.artists.items.length > 0) {
      const artist = data.artists.items[0];
      return artist; // Returns the URI of the first matching artist
    } else {
      return 'No artist found';
    }
  };

  async function createSpotifyPlaylist(userId, playlistName) {
    const accessToken = await refreshAccessToken();

    const endpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
      name: playlistName,
      description: 'New playlist description',
      public: false, // or true, if you want the playlist to be public
    });
  
    try {
      const response = await fetch(endpoint, { method: 'POST', headers, body });
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${data.error.message}`);
      }
  
      return data; // The response will contain the new playlist's data, including its ID
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async function addTracksToSpotifyPlaylist(playlistId, trackUris) {
    const accessToken = await refreshAccessToken();

    const endpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({ uris: trackUris });
  
    try {
      const response = await fetch(endpoint, { method: 'POST', headers, body });
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${data.error.message}`);
      }
  
      return data.snapshot_id; // The response contains a snapshot_id that can be used to reference the playlist's current version
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
      throw error;
    }
  }
  
async function getArtistTracks(artistId) {
    const accessToken = await refreshAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
  
    const data = await response.json();
    const ids = data.tracks.map(track => track.id)
    return ids;
  }
  
async function getTrackAudioFeatures(trackId) {
    const accessToken = await refreshAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
  
    return await response.json();
  }

async function calculateAverageAudioFeatures(artistId) {
    // const accessToken = await refreshAccessToken();
    const trackIds = await getArtistTracks(artistId);
  
    const features = await Promise.all(trackIds.map(trackId => getTrackAudioFeatures(trackId)));
  
    // Initialize an object to store the sum of each feature
    const featureSums = features.reduce((sums, feature) => {
      for (const key in feature) {
        if (typeof feature[key] === 'number') {
          sums[key] = (sums[key] || 0) + feature[key];
        }
      }
      return sums;
    }, {});
  
    // Calculate average
    const averages = {};
    const numTracks = features.length;
    for (const key in featureSums) {
      averages[key] = featureSums[key] / numTracks;
    }
  
    return  { [artistId]: averages };
  }

  async function getMultipleArtistsInfo(artistIds) {
    const accessToken = await refreshAccessToken();

    const url = `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Use flatMap to flatten the array of arrays into a single array
        // and then create a Set from it to eliminate duplicates
        const genreCounts = data.artists.flatMap(artist => artist.genres)
                                        .reduce((acc, genre) => {
                                            acc[genre] = (acc[genre] || 0) + 1;
                                            return acc;
                                        }, {});

        return genreCounts;
    } catch (error) {
        console.error('Error fetching artists info:', error);
        return [];
    }
}

async function createPlaylist(name, origin, recommendations) {
    const accessToken = await refreshAccessToken(); // Get a fresh access token
  
    const playlistName = `${origin} for ${name}`;
    const playlistDescription = "Generated based on opposite playlist recommendations.";
    const publicSetting = false;
  
    const data = {
      name: playlistName,
      description: playlistDescription,
      public: publicSetting,
    };
  
    // Create the playlist
    try {
        // we need to hard code my own username in here 
      const playlistResponse = await fetch(`https://api.spotify.com/v1/users/aragaosm/playlists`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      const playlistInfo = await playlistResponse.json();
    //   console.log(playlistInfo);
  
      if (playlistInfo && playlistInfo.id) {
        console.log(`Playlist ID: ${playlistInfo.id}`);
        console.log("Playlist created successfully!");
  
        // Add tracks to the created playlist
        const addTracksEndpoint = `/playlists/${playlistInfo.id}/tracks`;
        const tracksData = {
            uris:recommendations
        //   uris: recommendations.map(rec => rec.uri),
        
        };
  
        const tracksResponse = await fetch(`https://api.spotify.com/v1${addTracksEndpoint}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(tracksData)
        });
  
        const responseJson = await tracksResponse.json();
        if (responseJson.snapshot_id) {
          console.log("Tracks added successfully!");
          return {playlistInfo,responseJson} 
        } else {
          throw new Error("Error in adding tracks.");
        }
      } else {
        throw new Error("Error in creating playlist.");
      }
    } catch (error) {
      console.error(error.message);
    }
  }
  




// Exporting the functions to be used in other files
module.exports = {
    createPlaylist,
    getMultipleArtistsInfo,
    calculateAverageAudioFeatures,
    getArtistTracks,
    createSpotifyPlaylist,
    addTracksToSpotifyPlaylist,
    searchSpotifyArtist,
    getSpotifyUserInfo,
    selectPlaylist,
    fetchPlaylists,
    fetchSpotifyData,
    fetchSpotifyGeneratedPlaylists,
    fetchUserPlaylists,
    refreshAccessToken,
    fetchAudioFeaturesForPlaylist,
    fetchArtistId,
    getSpotifyRecommendations
};

