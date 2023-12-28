import { useState } from 'react';
import Link from 'next/link';

export default function GenerateOppositePlaylist() {
  const [username, setUsername] = useState('');
  const [playlistType, setPlaylistType] = useState('user');
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePlaylistTypeChange = (event) => {
    setPlaylistType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Update the endpoint as necessary based on your API route setup
      const response = await fetch(`/api/playlists?username=${encodeURIComponent(username)}&type=${playlistType}`);
      if (!response.ok) throw new Error('Network response was not ok.');

      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      setError('Failed to fetch playlists: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Generate Opposite Playlist</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <label htmlFor="username" className="block mb-2 text-sm font-bold">
            Spotify Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter your Spotify username"
            className="w-full p-2 rounded bg-white text-black mb-4"
            required
          />

          <div className="flex gap-4 mb-4">
            <div>
              <input
                type="radio"
                id="user-playlists"
                name="playlist-type"
                value="user"
                checked={playlistType === 'user'}
                onChange={handlePlaylistTypeChange}
                className="mr-2"
              />
              <label htmlFor="user-playlists" className="text-sm">
                My Playlists
              </label>
            </div>

            <div>
              <input
                type="radio"
                id="spotify-playlists"
                name="playlist-type"
                value="spotify"
                checked={playlistType === 'spotify'}
                onChange={handlePlaylistTypeChange}
                className="mr-2"
              />
              <label htmlFor="spotify-playlists" className="text-sm">
                Spotify's Playlists
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-spotify-green rounded hover:bg-spotify-green-darker"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Fetch Playlists'}
          </button>
        </form>

        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
        <p>Loading playlists...</p>
      ) : (
        playlists.length > 0 && (
          <div className="bg-spotify-green p-4 rounded-lg">
            <div className="playlists grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlists.map((playlist, index) => (
                <button
                  key={index}
                  className="playlist bg-black hover:bg-opacity-80 text-white py-1 px-2 text-sm rounded shadow"
                  onClick={() => handlePlaylistSelection(playlist)} // Define this function to handle click
                >
                  {playlist.name}
                </button>
              ))}
            </div>
          </div>
        )
      )}

        <div className="placeholder-generated-playlist">
          <p>The generated opposite playlist will be shown here...</p>
        </div>
      </main>
    </div>
  );
}
