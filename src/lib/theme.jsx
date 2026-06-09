import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({
  children,
}) => {
  const [theme, setTheme] =
    useState(() => {
      return (
        localStorage.getItem(
          'theme'
        ) || 'dark'
      );
    });

  useEffect(() => {
    const root =
      window.document.documentElement;

    root.classList.remove(
      'light',
      'dark'
    );

    root.classList.add(theme);

    localStorage.setItem(
      'theme',
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'dark'
        ? 'light'
        : 'dark'
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

export default {};
