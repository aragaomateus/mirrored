import { useState,useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image component
import { useRouter } from 'next/router';


export default function GenerateOppositePlaylist() {

  // All the State Variables
  const [username, setUsername] = useState('');
  const [playlistType, setPlaylistType] = useState('user');
  const [playlists, setPlaylists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [error, setError] = useState('');
  const [originalPlaylist, setOriginalPlaylist] = useState([]);
  const router = useRouter();
  const [userData, setUserData] = useState([]);
  const [sessionStart, setSessionStart] = useState(null);
  const [sessionEnd, setSessionEnd] = useState(null);
  const [overallRating, setOverallRating] = useState(null);
  const [currentPlaylist,setCurrentPlaylist] = useState('');
  const [newPlaylistLink,setNewPlaylistLink] =useState('');
  const [selectedPlaylist,setPlaylist] = useState('');

  const [userInfo,setUserInfo] = useState(null)

  function generateSessionId() {
    return window.crypto.randomUUID();
  }
  // Function to log user data
  const logUserAction = (data) => {
    setUserData(prevData => [
      ...prevData,
      {
        data
      }
    ]);
  };

  const handleRatingChange = (event) => {
    setOverallRating(event.target.value);
  };

  // Function to handle the rating submission
  const handleRatingSubmission = () => {
    if (overallRating != null) {
      logUserAction({
        action:'rate_overall_recommendations', 
        username:username,
        overallRating,
        timestamp: new Date().toISOString(),
        recommendations: recommendations.map(({ album_cover, ...rest }) => rest), 
        original: currentPlaylist
      });
      // Here you can add logic to send this rating to your backend
      console.log(`Overall rating submitted: ${overallRating}`);
    } else {
      console.log('No rating submitted');
    }
  };


const sendSessionData = async (sessionData) => {
  try {
    const response = await fetch('/api/session', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 'opposite_playlist',
        data: sessionData, // No need to stringify this again, as it's part of the overall object being stringified
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.error}`);
    }

    const result = await response.json();
    console.log('Session data sent successfully:', result);
  } catch (error) {
    console.error('Error sending session data:', error);
  }
};



  // When the component unmounts or before the page changes, send the user data
  useEffect(() => {
    // Record the start time when the component mounts
    const start = new Date().toISOString();
    setSessionStart(start);

    // Return a function to execute when the component unmounts
    return () => {
  
    };
  }, []);

  const navigateToMainMenu = () => {
    const end = new Date().toISOString();
    setSessionEnd(end);

    // Send the session data to the server
    sendSessionData({ session_id:generateSessionId(),
      start: sessionStart,
       end , 
       details:userData});

    router.push('/'); // Assuming '/' is your main menu route
  };
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePlaylistTypeChange = (event) => {
    setPlaylistType(event.target.value);

  };


  const getUserInfo = async ()=>{
    const query = new URLSearchParams({ username }).toString();

    try {
      console.log(username)
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
        setUserInfo(result)
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

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

      logUserAction({
        action:'fetch_playlists',   
        timestamp: new Date().toISOString(),
        username: username,
        playlistType: playlistType,
      });
      getUserInfo()

    } catch (err) {
      setError("Failed to fetch playlists: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist =async() =>{
    setLoadingCreate(true);

    // Add the artistName to the artistList if it's not empty or already present
    const tracks = Array(recommendations.map(recommendation => recommendation.uri));
    
    // const name = userInfo.display_name
    const playlistName = "Opposite Playlist of " + selectedPlaylist + " "
    console.log(userInfo.display_name)
    const name = userInfo.display_name
    const query = new URLSearchParams({ name ,playlistName,tracks }).toString();

    try {

      const response = await fetch(`/api/create_playlist?${query}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      console.log('result',result.external_urls.spotify)

      if (result) {
        console.log('result',result.external_urls.spotify)
        setNewPlaylistLink(result.external_urls.spotify)

        // Handle the successful response here
        // if (artistName && !artistList.includes(result.name)&& !uriList.includes(result.uri)) {
        //   setArtistList([...artistList, result.name]);
        //   setArtistName(''); // Clear input after adding
        //   setURIList([...uriList,result.uri.split(':')[2]])
        //   console.log(uriList)
        // }
        } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    }

};

  const handlePlaylistSelection = async (event) => {
    setLoading(true);
    setError('');
    setRecommendations([])
    setNewPlaylistLink('')
    setPlaylist(event.name)
    try {
      // Update the endpoint as necessary based on your API route setup
      const response = await fetch(`/api/recommendations?uri=${encodeURIComponent(event.uri)}`);
      if (!response.ok) throw new Error("Network response was not ok.");

      const data = await response.json();
      setOriginalPlaylist(data[1])
      setRecommendations(data[0]);
      setCurrentPlaylist(event.uri.split(':')[2])
      logUserAction({
        action:'select_playlist', 
        timestamp: new Date().toISOString(),
        username:username,
        playlistUri: event.uri.split(':')[2],
        recommendations: data[0].map(({ uri, ...rest }) => uri.split(':')[2])

      });
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
      className="fixed font-bold custom-rounded-btn top-0 left-0 mt-4 ml-4 px-4 py-2 bg-spotify-green rounded hover:bg-spotify-green-darker text-sm z-10"
    >
      Back
    </button>
    <main className="container mx-auto p-4 pb-20">
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
            className="px-4  font-bold custom-rounded-btn py-2 bg-spotify-green rounded hover:bg-spotify-green-darker"
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
            <div className="playlists grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((playlist, index) => (
                  <button
                    key={index}
                    className="playlist bg-black hover:bg-opacity-50 text-white py-1 px-2 text-sm rounded shadow"
                    onClick={() => handlePlaylistSelection(playlist)} // Define this function to handle click
                  >
                    {playlist.name}
                  </button>
                ))}
              </div>
            </div>
          )
        )}
{Array.isArray(recommendations) && recommendations.length > 0 && (
  <div className="rating-section text-center mt-4 mb-8">
    <h3 className="text-xl font-bold mb-2">Rate the Recommendations</h3>
    <div className="flex justify-center items-center">
      <input
        type="range"
        min="1"
        max="5"
        step="0.5"
        value={overallRating}
        onChange={handleRatingChange}
        className="rating-slider"
      />
      <div className="ml-2 text-lg">{overallRating} {'★'}</div>
    </div>
    <button
      className="px-4 font-bold custom-rounded-btn py-2 bg-spotify-green rounded hover:bg-spotify-green-darker"
      onClick={handleRatingSubmission}
      disabled={overallRating === 0}
    >
      Submit Rating
    </button>
  </div>
)}

<div className="flex-center placeholder-generated-playlist bg-spotify-black text-spotify-white p-4 rounded-lg">         
{Array.isArray(recommendations) && minLength > 0 && (
  <>


    <div className="mt-6 text-center mb-8">
    <h2 className="w-full text-center text-xl font-bold mb-4">Opposite Playlist VS Original Playlist</h2>

        <button
          type="button"
          onClick={handleCreatePlaylist}
          className="w-1/2 p-2 font-bold custom-rounded-btn bg-spotify-green text-md rounded hover:bg-spotify-green-darker mt-4"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Playlist?"}
        </button>
      </div>

  </>
)}

{newPlaylistLink.length > 0 && (
        <div className="w-full text-center mt-4 mb-8">
          <a href={newPlaylistLink} className="text-spotify-green hover:underline">
            Open Playlist
          </a>
        </div>
      )}
 
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
                        <div className="text-right">
                        <p className="text-sm md:text-base font-bold">{recommendation.artist}</p>
                        <p className="text-xs md:text-sm">{recommendation.name}</p>
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
                          <p className="text-sm md:text-base font-bold">{item.artist}</p>
                          <p className="text-xs md:text-sm">{item.name}</p>
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
