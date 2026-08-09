import * as React from 'react';

export type Theme = 'light' | 'dark';

const ThemeContext = React.createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(
  null,
);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  /** Element that carries `data-theme`. Defaults to <html>. */
  target?: HTMLElement | null;
}

export function ThemeProvider({ children, defaultTheme = 'light', target }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);

  React.useEffect(() => {
    const el = target ?? document.documentElement;
    el.dataset.theme = theme;
  }, [theme, target]);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a <ThemeProvider>');
  return context;
}

/** Three drifting orbs behind the page, so the glass has something to refract. */
export function AmbientLight() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="o1" />
      <span className="o2" />
      <span className="o3" />
    </div>
  );
}
