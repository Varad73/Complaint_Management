import { createContext, useState, useEffect, useContext } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // The '/api/auth/me' endpoint will verify the cookie and return the user
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (error) {
        // This is expected if the user is not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    // We can also add an API call here to invalidate the cookie on the server
    setUser(null);
  };
  
  // The value includes the user, loading state, setUser for login, and logout
  const value = { user, loading, setUser, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a custom hook that components can use to access the context
// MODIFIED: Added the 'export' keyword to make this function available to other files.
export function useAuth() {
  return useContext(AuthContext);
}

