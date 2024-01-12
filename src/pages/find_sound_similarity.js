import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ProgressBar = ({ similarity, loading }) => {

  
  const [currentWidth, setCurrentWidth] = useState(0);

  useEffect(() => {
    // When loading starts, reset the bar to 0%
    if (loading) {
      setCurrentWidth(0);
    } else {
      // When loading finishes, animate to the actual similarity percentage
      const timeoutId = setTimeout(() => setCurrentWidth(similarity), 100); // Short delay before starting the animation
      return () => clearTimeout(timeoutId);
    }
  }, [loading, similarity]);

  const progressBarStyle = {
    width: `${currentWidth}%`,
    backgroundColor: 'green',
    height: '20px',
    transition: 'width 2s ease-in-out', // Animates over 2 seconds
  };

  return (
    <div className="w-full bg-gray-300 rounded">
      <div style={progressBarStyle} className="rounded text-right pr-2">
        {currentWidth.toFixed(0)}%
      </div>
    </div>
  );
};




const useLoadingMessages = (loading) => {
  const [message, setMessage] = useState('');
  const messages = ["Loading...", "Still working...", "Almost there...", "Just a moment...", "Hang tight, calculating...", "Finishing up..."];

  useEffect(() => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      if (loading) {
        setMessage(messages[messageIndex % messages.length]);
        messageIndex++;
      } else {
        clearInterval(interval);
        setMessage('');
      }
    }, 1500); // Change message every second

    return () => clearInterval(interval);
  }, [loading]);

  return message;
};



export default function FindSoundSimilarity() {
  function generateSessionId() {
    return window.crypto.randomUUID();
  }
  
  const [userData, setUserData] = useState([]);
  const [sessionStart, setSessionStart] = useState(null);
  const [sessionEnd, setSessionEnd] = useState(null);


  const sendSessionData = async (sessionData) => {
    try {
      const response = await fetch('/api/session', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 'find_similarity',
          session: sessionData.end,
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

  const logUserAction = (action) => {
    setUserData(prevData => [
      ...prevData,
      {
        action,
      }
    ]);
  };
  const [overallRating, setOverallRating] = useState(null);
   const handleRatingChange = (event) => {
    setOverallRating(event.target.value);
  };
  const handleRatingSubmission = () => {
    if (overallRating != null) {
      logUserAction('rate_overall_recommendations', {
        usernameA:usernameA,
        usernameB:usernameB,
        overallRating,
        timestamp: new Date().toISOString(),
        genresA: payload.userA.genres,
        genresB: payload.userB.genres,

      });
      // Here you can add logic to send this rating to your backend
      console.log(`Overall rating submitted: ${overallRating}`);
    } else {
      console.log('No rating submitted');
    }
  };

  useEffect(() => {
    // Record the start time when the component mounts
    const start = new Date().toISOString();
    setSessionStart(start);

    // Return a function to execute when the component unmounts
    return () => {
  
    };
  }, []);
  const router = useRouter();
  const [payload,setPayload] = useState({});

  const [usernameA, setUsernameA] = useState('');
  const [usernameB, setUsernameB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [similarity,setSimilarity] = useState(0)
  const loadingMessage = useLoadingMessages(loading);

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
        setSimilarity(result.similarity)
        setPayload(result.users)
        logUserAction({action:'got_similarity', 
          usernameA:usernameA,
          usernameB:usernameB,
          similarity:result.similarity,
          timestamp: new Date().toISOString(),
          genresA: result.users.userA.genres,
          genresB: result.users.userB.genres
        });

      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const getRandomGenres = (genres) => {
    // Convert the genres object into an array of [genre, count] pairs
    const genresArray = Object.entries(genres);

    // Sort the array based on the count, in descending order
    genresArray.sort((a, b) => b[1] - a[1]);

    // Slice the first 7 genres from the sorted array
    const topGenres = genresArray.slice(0, 7);

    // Return only the genre names
    return topGenres.map(genrePair => genrePair[0]);
};


  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
    {/* Fixed positioned "Back to Main Menu" button */}
    <button
      onClick={navigateToMainMenu}
      className="fixed top-0 custom-rounded-btn font-bold left-0 mt-4 ml-4 px-4 py-2 bg-spotify-green rounded hover:bg-spotify-green-darker text-sm z-10" // Adjusted classes for fixed positioning and size
    >
      Back
    </button>
      <main className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Spotify Compatibility Test</h1>

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
            className="px-4 font-bold custom-rounded-btn py-2 bg-spotify-green rounded hover:bg-spotify-green-darker mx-auto block"
            disabled={loading}
          >
            {loading ? (
              // Replace this div with your loading animation component
              <div className="loader"></div>
            ) : (
              "Find Compatibility"
            )}
          </button>
        </form>

        {/* Always render ProgressBar, but it animates only after loading is done */}

        {/* Display loading messages */}
        {loading && <p className="text-spotify-green">{loadingMessage}</p>}
        {!loading && <ProgressBar similarity={similarity} loading={loading} />}
        <div className="container mx-auto p-4">
            {!loading && similarity > 0 && (
                <>
                    <p className="text-white font-bold">{`${payload.userA.info.display_name} and ${payload.userB.info.display_name} Similarity Score!`}</p>
                    <div className="flex justify-between">
                        <div className="w-1/2">
                            <h3 className="text-white font-bold mt-4">{`${payload.userA.info.display_name} listens to these genres:`}</h3>
                            <ul>
                                { getRandomGenres(payload.userA.genres).map((genre, index) => (
                                    <li key={index} className="text-white">{genre}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-1/2">
                            <h3 className="text-white font-bold mt-4">{`${payload.userB.info.display_name} listens to these genres:`}</h3>
                            <ul>
                                { getRandomGenres(payload.userB.genres).map((genre, index) => (
                                    <li key={index} className="text-white">{genre}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
        {similarity > 0 && (
      <div className="rating-section text-center mt-4">
        <h3 className="text-xl font-bold mb-2">Rate the Similarity</h3>
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
            className="px-4  font-bold custom-rounded-btn py-2 bg-spotify-green rounded hover:bg-spotify-green-darker"
            onClick={handleRatingSubmission}
        disabled={overallRating === 0}
      >
        Submit Rating
      </button>
      </div>
    )}
    <p>
           
    </p>
      </main>
    </div>

  );
}
