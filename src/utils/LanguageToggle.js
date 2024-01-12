// LanguageToggle.js
import { useLanguage } from './LanguageContext';

export default function LanguageToggle(){
    const { language, setLanguage } = useLanguage();
  
    const toggleLanguage = () => {
      setLanguage(prevLanguage => (prevLanguage === 'en' ? 'pt' : 'en'));
    };
  
  
    return (
<div className="flex items-center justify-center p-2">
  {/* Toggle switch container */}
  <div className="relative w-24 h-10 bg-gray-500 rounded-full shadow-inner" onClick={toggleLanguage}>
    {/* Toggle switch */}
    <div className={`w-1/2 h-full ${language === 'en' ? 'bg-spotify-green' : 'bg-white'} rounded-full shadow-md transform duration-300 ease-in-out ${language === 'en' ? 'translate-x-0' : 'translate-x-full'}`}>
      <span className={`absolute inset-y-0 left-0 flex items-center justify-center w-full h-full text-sm font-bold transition-opacity duration-300 ease-in-out ${language === 'en' ? 'opacity-100' : 'opacity-0'}`}>
        EN
      </span>
      <span className={`absolute inset-y-0 text-spotify-green right-0 flex font-black items-center justify-center w-full h-full text-sm font-bold transition-opacity duration-300 ease-in-out ${language === 'en' ? 'opacity-0' : 'opacity-100'}`}>
        PT
      </span>
    </div>
  </div>
</div>

    );
  };