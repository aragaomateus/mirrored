import Link from 'next/link';

const buttonStyles = `bg-spotify-green text-spotify-black rounded-full font-bold hover:bg-spotify-black hover:text-spotify-green cursor-pointer shadow-lg text-xl px-10 py-3 inline-block`;

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-spotify-black text-spotify-white">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
      <h2 className="text-6xl md:text-5xl lg:text-6xl font-bold mb-6 text-center sm:px-4">Sound Compass</h2>

        {/* Circular buttons container */}
        <div className="relative w-96 h-96 -white rounded-full flex items-center justify-center mt-6">
          {/* Grid pattern overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/path-to-grid-pattern.png')] rounded-full"></div>
          
          {/* Buttons */}
          <div className="absolute top-1/4 w-full flex flex-col items-center space-y-6">
            {/* Link to Generate Opposite Playlist */}
            <Link href="/generate_opposite_playlist">
              <p className={buttonStyles}> Spotify Tastebreakers Playlists</p>
            </Link>
            
            {/* Link to Find Out Sound Similarity */}
            <Link href="/find_sound_similarity">
              <p className={buttonStyles}> Spotify Compatibility Test </p>
            </Link>
            
            <Link href="/custom_playlist">
              <p className={buttonStyles}> Build Custom Playlist </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

