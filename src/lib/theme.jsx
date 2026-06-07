import { createContext, useContext } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        setTheme: () => {}
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

const theme = {};

export default theme;
