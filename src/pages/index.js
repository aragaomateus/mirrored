import { useState } from 'react';
import  {useLanguage}  from './LanguageContext';
import  LanguageToggle  from './LanguageToggle';
import Link from 'next/link';
// import translations from './translations'; // 

const buttonStyles = `bg-spotify-green text-spotify-black rounded-full font-bold hover:bg-spotify-black hover:text-spotify-green cursor-pointer shadow-lg text-xl px-10 py-3 inline-block`;

const translations = {
  en: {
    title: "Sound Compass",
    tastebreakers:  "Spotify Tastebreakers Playlists",
    compatibility:  "Spotify Compatibility Test",
    customPlaylist: "Playlist Finesser",
    toggleLanguage: "Português"
  },
  pt: {
    title: "Sound Compass",
    tastebreakers:  "Decubra Suas Playlist Opostas",
    compatibility:  "Teste de Compatibilidade",
    customPlaylist: "Personalize Playlists",
    toggleLanguage: "English"
  }
};  
// This should be at the same level as your component, not inside it.

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];


 

  // const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-spotify-black text-spotify-white">

      <LanguageToggle/>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h2 className="text-6xl md:text-5xl lg:text-6xl font-bold mb-6 text-center sm:px-4">{t.title}</h2>

        <div className="relative w-96 h-96 rounded-full flex items-center justify-center mt-6">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/path-to-grid-pattern.png')] rounded-full"></div>
          
          <div className="absolute top-1/4 w-full flex flex-col items-center space-y-6">
            <Link href="/generate_opposite_playlist">
              <p className={buttonStyles}>{t.tastebreakers}</p>
            </Link>
            
            <Link href="/find_sound_similarity">
              <p className={buttonStyles}>{t.compatibility}</p>
            </Link>
            
            <Link href="/custom_playlist">
              <p className={buttonStyles}>{t.customPlaylist}</p>
            </Link>
          </div>
        </div>
        
      </main>
      
    </div>
  );
}
