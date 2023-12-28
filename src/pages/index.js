import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-spotify-black text-spotify-white">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-6">Welcome to Mirrored</h1>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6">
          <Link href="/generate_opposite_playlist" passHref>
            <div className="p-6 mt-6 text-left border border-spotify-green w-96 rounded-xl hover:text-spotify-black hover:bg-spotify-green cursor-pointer">
              <h2 className="text-2xl">Generate Opposite Playlist &rarr;</h2>
            </div>
          </Link>

          <Link href="/find-sound-similarity" passHref>
            <div className="p-6 mt-6 text-left border border-spotify-green w-96 rounded-xl hover:text-spotify-black hover:bg-spotify-green cursor-pointer">
              <h2 className="text-2xl">Find Out Sound Similarity &rarr;</h2>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

