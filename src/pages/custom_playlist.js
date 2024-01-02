import { useState,useEffect } from 'react';
import { useRouter } from 'next/router';

import { getSpotifyUserInfo } from '../utils/spotifyAPI'; // Adjust the import path as needed


export default function CustomPlaylist() {
  const navigateToMainMenu = () => {
    router.push('/'); // Assuming '/' is your main menu route
  };
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

// Inside your React component
const [userInfo, setUserInfo] = useState(null);
useEffect(() => {
  if (userInfo) {
    console.log(userInfo);
  }
}, [userInfo]);


const handleSubmit = async (event) => {
  event.preventDefault();
  setLoading(true);
  setError('');
  const query = new URLSearchParams({ username }).toString();


  try {

    const response = await fetch(`/api/get_user?${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();

    if (result) {
      // Handle the successful response here
      console.log(result)
      setUserInfo(result)
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
    <div className="flex h-screen bg-black text-white">
      <div className="m-auto w-full max-w-lg p-8"> {/* Center content and set max width */}
        {/* Back to Main Menu button */}
        <button
          onClick={navigateToMainMenu}
          className="absolute top-4 left-4 px-4 py-2 bg-spotify-green text-sm rounded hover:bg-spotify-green-darker z-10"
        >
          Back to Main Menu
        </button>

        {/* Main content */}
        <h1 className="text-4xl font-bold mb-8 text-center">Let's Build Your Custom Playlist</h1>
        
        {/* Username form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Spotify username"
            className="w-full p-4 rounded bg-white text-black text-lg" // Increased width and padding
          />
          <button
            type="submit"
            className="w-full p-4 bg-spotify-green text-lg rounded hover:bg-spotify-green-darker" // Increased padding and font size
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}

          </button>
        </form>
        {userInfo && <div>{"Let's Build a playlist for "+ userInfo.display_name}</div>} {/* Display userInfo for debugging */}
      </div>
    </div>
  );
}
