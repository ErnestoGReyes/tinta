import { createContext, useContext, useMemo } from "react";
import { getPalette, DEFAULT_THEME_ID } from "../design/tokens";

const ThemeContext = createContext(null);

export function ThemeProvider({ isDark, themeId = DEFAULT_THEME_ID, children }) {
  const theme = useMemo(() => getPalette(themeId, isDark), [themeId, isDark]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx || getPalette(DEFAULT_THEME_ID, true);
}
