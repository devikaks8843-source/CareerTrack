import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('careertrackUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const saveUser = (userData) => {
    localStorage.setItem('careertrackUser', JSON.stringify(userData));
    localStorage.setItem('careertrackToken', userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('careertrackUser');
    localStorage.removeItem('careertrackToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
