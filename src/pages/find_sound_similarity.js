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

const adjustSimilarity=(similarity)=>{
  console.log(similarity)
  if ((similarity - 70) > 0 ){
    console.log((similarity - 70)/30)
    return ((similarity - 70)/30) *100

  } else if ((similarity - 80) < 0){

    return similarity
  }
}




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
  const router = useRouter();
  const navigateToMainMenu = () => {
    router.push('/'); // Assuming '/' is your main menu route
  };
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
        setSimilarity(result.similarity*100)
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
    {/* Fixed positioned "Back to Main Menu" button */}
    <button
      onClick={navigateToMainMenu}
      className="fixed top-0 left-0 mt-4 ml-4 px-4 py-2 bg-spotify-green rounded hover:bg-spotify-green-darker text-sm z-10" // Adjusted classes for fixed positioning and size
    >
      Back to Main Menu
    </button>
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

        {/* Always render ProgressBar, but it animates only after loading is done */}

        {/* Display loading messages */}
        {loading && <p className="text-spotify-green">{loadingMessage}</p>}
        {!loading && <ProgressBar similarity={adjustSimilarity(similarity)} loading={loading} />}

      </main>
    </div>

  );
}
