import { useState,useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Import Next.js Image component



export default function CustomPlaylist() {
  const navigateToMainMenu = () => {
    router.push('/'); // Assuming '/' is your main menu route
  };
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [artistName, setArtistName] = useState(''); // State for the artist name input
  const [artistList, setArtistList] = useState([]); // State for the list of artists
  const [uriList, setURIList] = useState([]); // State for the list of artists
  const [playlistName, setPlaylistName] = useState(''); // State for the playlist name input
  const [newPlaylist, setNewPlaylist] = useState([])
  const handleRemoveArtist = (indexToRemove) => {
    // Remove artist by index
    setArtistList(artistList.filter((_, index) => index !== indexToRemove));
    // Remove URI by index
    setURIList(uriList.filter((_, index) => index !== indexToRemove));
  };
  // Function to handle creating the playlist
  const handleCreatePlaylist = async () => {
    setLoading(true);
    setError('');

    const payload = {
      username,
      uris: uriList,
      playlistName: playlistName
    };

    try {
      const response = await fetch('/api/create_playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      const result = await response.json();
      console.log(result); // For debugging, shows the response from the server
      setNewPlaylist(result)
      // You can set some state here to indicate that the playlist was created successfully
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  // Function to handle adding an artist to the list
  const handleAddArtist = async () => {
    // Add the artistName to the artistList if it's not empty or already present
    const query = new URLSearchParams({ artistName }).toString();

    try {

      const response = await fetch(`/api/get_artist?${query}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      console.log(result)
  
      if (result) {
        // Handle the successful response here
        if (artistName && !artistList.includes(result.name)&& !uriList.includes(result.uri)) {
          setArtistList([...artistList, result.name]);
          setArtistName(''); // Clear input after adding
          setURIList([...uriList,result.uri.split(':')[2]])
          console.log(uriList)
        }
        } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };
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
    <div className="h-screen bg-black text-white flex flex-col items-center pt-8 overflow-auto">
      <div className="w-full max-w-2xl px-4"> {/* Centered container with max-width */}
        {/* Back to Main Menu button */}
        <button
          onClick={navigateToMainMenu}
          className="mb-4 px-4 py-2 custom-rounded-btn font-bold bg-spotify-green text-xs rounded hover:bg-spotify-green-darker self-start"
        >
          Back
        </button>

        {/* Main content */}
        <h1 className="text-3xl font-bold text-center mb-6">Let's Build Your Custom Playlist</h1>
        
        {/* Username form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-center">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Spotify username"
            className="block w-full p-2 rounded bg-white text-black"
          />
          <button
            type="submit"
            className="w-1/2 p-2 font-bold custom-rounded-btn bg-spotify-green text-md rounded hover:bg-spotify-green-darker mx-auto"
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>


      {userInfo && (
                  <>
                  <div>{"Let's build a playlist for " + userInfo.display_name}</div>
                  {/* Artist input form */}
                  <div className="space-y-4 text-center"> {/* Corrected typo here */}
                    <input
                      type="text"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="Enter artist name"
                      className="w-full p-2 rounded bg-white text-black"
                    />
                    <button
                      type="button"
                      onClick={handleAddArtist}
                      className="w-1/2 p-2 bg-spotify-green text-md rounded hover:bg-spotify-green-darker mx-auto"
                    >
                      Add
                    </button>
                  </div>
            {/* List of added artists */}
            <ul className="mt-4">
    {artistList.map((artist, index) => (
      <li key={index} className="flex justify-between items-center p-2 bg-spotify-green rounded shadow my-1">
        <span className="ml-2">{artist}</span>
        <button
          onClick={() =>  handleRemoveArtist(index)}
          className="bg-red-500 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center ml-4"
        >
          × {/* This is a multiplication symbol (U+00D7), often used to represent a close or delete action */}
        </button>
      </li>
    ))}
  </ul>

          </>
        )} 

         {/* Conditional rendering for after user information is fetched */}
         {artistList.length > 0 && (
  <div className="flex flex-col items-center"> {/* This ensures centering for all child elements */}
    {/* Playlist name input */}
    <input
      type="text"
      value={playlistName}
      onChange={(e) => setPlaylistName(e.target.value)}
      placeholder="Enter playlist name"
      className="w-full p-2 rounded bg-white text-black mt-4"
    />
    {/* Create Playlist button */}
    <button
      type="button"
      onClick={handleCreatePlaylist}
      className="w-1/2 p-2 bg-spotify-green text-md rounded hover:bg-spotify-green-darker mt-4" // Use w-1/2 for half width
      disabled={loading || playlistName.trim() === ''}
    >
      {loading ? "Creating..." : "Create Playlist"}
    </button>
  </div>
)}

        {/* Error message display */}
        {error && <div className="text-red-500">{error}</div>}


      </div>
      <div className="m-auto w-full max-w-lg p-8">

      </div>
        {/* Playlist recommendations */}
        {newPlaylist.length > 0 && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-bold mb-4">
              Playlist "{playlistName}" for {userInfo.display_name}
            </h2>
            <div className="space-y-4">
              {newPlaylist.map((recommendation, index) => (
                <div key={index} className="flex items-center justify-center p-2 bg-spotify-green rounded shadow-lg">
                  {/* Image component ... */}
                  <Image 
                  src={recommendation.album_cover} 
                  alt={recommendation.name} 
                  width={64} // Define width
                  height={64} // Define height
                  className="object-cover rounded mr-2"
              />
                  <p className="text-sm">{`${recommendation.name} by ${recommendation.artist}`}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message display */}
        {error && <div className="text-red-500 text-center">{error}</div>}

      
    </div>
  );
}