import { AuthProvider } from '../services/AuthContext';
import '@/styles/globals.css';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
