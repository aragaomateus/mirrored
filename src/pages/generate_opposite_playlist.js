import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import { useRouter } from 'next/router';

export default function GenerateOppositePlaylist() {
  const [username, setUsername] = useState('');
  const [playlistType, setPlaylistType] = useState('user');
  const [playlists, setPlaylists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalPlaylist, setOriginalPlaylist] = useState([]);
  const router = useRouter();
  const navigateToMainMenu = () => {
    router.push('/'); // Assuming '/' is your main menu route
  };
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePlaylistTypeChange = (event) => {
    setPlaylistType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Update the endpoint as necessary based on your API route setup
      const response = await fetch(`/api/playlists?username=${encodeURIComponent(username)}&type=${playlistType}`);
      if (!response.ok) throw new Error("Network response was not ok.");

      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      setError("Failed to fetch playlists: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelection = async (event) => {
    setLoading(true);
    setError('');

    try {
      // Update the endpoint as necessary based on your API route setup
      const response = await fetch(`/api/recommendations?uri=${encodeURIComponent(event)}`);
      if (!response.ok) throw new Error("Network response was not ok.");

      const data = await response.json();
      setOriginalPlaylist(data[1])
      setRecommendations(data[0]);
    } catch (err) {
      setError("Please Try Again");
      console.log(err.message)
    } finally {
      setLoading(false);
    }
  };

  const minLength = (Array.isArray(recommendations) && Array.isArray(originalPlaylist))
    ? Math.min(recommendations.length, originalPlaylist.length)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <button
        onClick={navigateToMainMenu}
        className="fixed top-0 left-0 mt-4 ml-4 px-4 py-2 bg-spotify-green rounded hover:bg-spotify-green-darker text-sm z-10" // Adjusted classes for fixed positioning and size
      >
        Back to Main Menu
      </button>
      <main className="container mx-auto p-4">
        <div className="tooltip">
          <h1 className="text-3xl font-bold mb-4 inline-block">Songs We Know You Will Hate</h1>
          <div className="question-mark-circle">&#63;</div> {/* Unicode for question mark */}
          <span className="tooltiptext">Let's generate an opposite playlist full of song you havent heard before.
            Add you username, pick your playlist and the see the magic happen. </span>
        </div>




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
                checked={playlistType === "user"}
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
                checked={playlistType === "spotify"}
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
            {loading ? "Loading..." : "Get Your Playlists"}
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
                    className="playlist bg-black hover:bg-opacity-50 text-white py-1 px-2 text-sm rounded shadow"
                    onClick={() => handlePlaylistSelection(playlist.uri)} // Define this function to handle click
                  >
                    {playlist.name}
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        <div className=" flex-center placeholder-generated-playlist bg-spotify-black text-spotify-white p-4 rounded-lg">
          {Array.isArray(recommendations) && minLength > 0 ?
            <h2 className="w-full text-center text-xl font-bold mb-4">Generated Opposite Playlist VS Your Original Playlist</h2>
            : " "
          }
          <div className="playlist-list">
            {!Array.isArray(recommendations) ? <h3 className="text-red-500 font-bold">Please Select the Playlist Again</h3>
              :
              <div className="flex justify-center gap-8">
                {/* Determine the maximum length of the two arrays */}

                {/* Column for the recommendation array */}
                <div className="w-1/2">

                  {Array.from({ length: minLength }).map((_, index) => {
                    const recommendation = recommendations[index];
                    return recommendation ? (
                      <div key={index} className="playlist-item bg-spotify-green p-2 rounded shadow-lg mb-2 flex items-center">
                        <Image
                          src={recommendation.album_cover}
                          alt={recommendation.name}
                          width={64}
                          height={64}
                          className="object-cover rounded mr-2"
                        />
                        <div>
                          <p className="text-sm">{`${recommendation.name} by ${recommendation.artist}`}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={index} className="playlist-item bg-spotify-green p-2 rounded shadow-lg mb-2 flex items-center">
                        {/* Empty placeholder */}
                      </div>
                    );
                  })}
                </div>

                {/* Column for the originalPlaylist */}
                <div className="w-1/2">
                  {Array.from({ length: minLength }).map((_, index) => {
                    const item = originalPlaylist[index];
                    return item ? (
                      <div key={index} className="playlist-item bg-spotify-green p-2 rounded shadow-lg mb-2 flex items-center justify-between">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover rounded mr-2"
                        />
                        <div className="text-right">
                          <p className="text-sm font-bold">{item.artist}</p>
                          <p className="text-xs">{item.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={index} className="playlist-item bg-spotify-green p-2 rounded shadow-lg mb-2 flex items-center">
                        {/* Empty placeholder */}
                      </div>
                    );
                  })}
                </div>
              </div>

            }
          </div>
        </div>
      </main>
    </div>
  );
}
