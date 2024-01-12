import '@/styles/globals.css'
import { LanguageProvider } from './LanguageContext';

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}