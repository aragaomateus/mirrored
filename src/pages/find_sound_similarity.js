import { useState } from 'react';
import { fetchPlaylists,fetchPlaylistTracks } from '../utils/spotifyAPI'; // Adjust the import path as needed

export default function FindSoundSimilarity() {
  const [usernameA, setUsernameA] = useState('');
  const [usernameB, setUsernameB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameChange = (setUsername) => (event) => {
    setUsername(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const query = new URLSearchParams({ usernameA, usernameB }).toString();

      const response = await fetch(`/api/find_similarity?${query}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      if (result.success) {
        // Handle the successful response here
        console.log(result)
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <main className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Found the Sound Similarity</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex justify-around mb-4">
            <input
              type="text"
              id="usernameA"
              name="usernameA"
              value={usernameA}
              onChange={handleUsernameChange(setUsernameA)}
              placeholder="Enter your Spotify username"
              className="w-5/12 p-2 rounded bg-white text-black"
              required
            />
            <input
              type="text"
              id="usernameB"
              name="usernameB"
              value={usernameB}
              onChange={handleUsernameChange(setUsernameB)}
              placeholder="Enter their Spotify username"
              className="w-5/12 p-2 rounded bg-white text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-spotify-green rounded hover:bg-spotify-green-darker mx-auto block"
            disabled={loading}
          >
            {loading ? (
              // Replace this div with your loading animation component
              <div className="loader"></div>
            ) : (
              "Find Similarity"
            )}
          </button>
        </form>

        {error && <p className="text-red-500">{error}</p>}
      </main>
    </div>
  );
}
