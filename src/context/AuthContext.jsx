import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Scopes: profile for sign-in, drive.appdata for sync, calendar for widget
const SCOPES = [
  'profile',
  'email',
  'openid',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

function loadGsiScript(onReady) {
  if (window.google?.accounts?.oauth2) { onReady(); return; }
  const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  if (!existing) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
  const interval = setInterval(() => {
    if (window.google?.accounts?.oauth2) { clearInterval(interval); onReady(); }
  }, 150);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('synapse-user')) ?? null; }
    catch { return null; }
  });
  const [accessToken, setAccessToken] = useState(null);
  const tokenClientRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return;

    loadGsiScript(() => {
      if (tokenClientRef.current) return;
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) return;
          const token = response.access_token;
          setAccessToken(token);

          // Fetch user profile using the access token
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const profile = await res.json();
            const userData = {
              name: profile.name,
              email: profile.email,
              picture: profile.picture,
            };
            setUser(userData);
            localStorage.setItem('synapse-user', JSON.stringify(userData));
          } catch {
            // profile fetch failed — keep existing user if any
          }
        },
      });

      // If user was previously signed in, silently request a new token
      if (localStorage.getItem('synapse-user')) {
        tokenClientRef.current.requestAccessToken({ prompt: '' });
      }
    });
  }, []);

  const requestSignIn = () => {
    if (!CLIENT_ID || !tokenClientRef.current) return;
    tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
  };

  const signOut = () => {
    if (accessToken) window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
    window.google?.accounts?.id?.disableAutoSelect?.();
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('synapse-user');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, requestSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
