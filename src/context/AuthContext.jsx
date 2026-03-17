import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function loadGsiScript(onReady) {
  if (window.google?.accounts?.id) {
    onReady();
    return;
  }
  // Script may already be in the DOM (added by CalendarWidget) — just wait for it
  const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  if (!existing) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
  const interval = setInterval(() => {
    if (window.google?.accounts?.id) {
      clearInterval(interval);
      onReady();
    }
  }, 150);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('synapse-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const initialised = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID) return;

    loadGsiScript(() => {
      if (initialised.current) return;
      initialised.current = true;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          const payload = parseJwt(response.credential);
          if (!payload) return;
          const profile = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
          };
          setUser(profile);
          localStorage.setItem('synapse-user', JSON.stringify(profile));
        },
        auto_select: false,
      });
    });
  }, []);

  const requestSignIn = () => {
    if (!CLIENT_ID || !window.google?.accounts?.id) return;
    window.google.accounts.id.prompt();
  };

  const signOut = () => {
    window.google?.accounts?.id?.disableAutoSelect();
    setUser(null);
    localStorage.removeItem('synapse-user');
  };

  return (
    <AuthContext.Provider value={{ user, requestSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
