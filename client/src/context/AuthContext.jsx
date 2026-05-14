import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('credflow_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('credflow_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    setUser(data);
    localStorage.setItem('credflow_user', JSON.stringify(data));
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await registerUser({ name, email, password });
    // Don't auto-login — user needs to verify email first
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('credflow_user');
  };

  const updateUserData = (data) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('credflow_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserData, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
