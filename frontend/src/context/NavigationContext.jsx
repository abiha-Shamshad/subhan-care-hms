import { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [payload, setPayload] = useState(null);

  const navigate = useCallback((page, nextPayload = null) => {
    setCurrentPage(page);
    setPayload(nextPayload);
  }, []);

  const clearPayload = useCallback(() => setPayload(null), []);

  return (
    <NavigationContext.Provider value={{ currentPage, navigate, payload, clearPayload }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
};
