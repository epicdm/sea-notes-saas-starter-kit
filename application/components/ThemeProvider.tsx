"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: ThemeProviderProps) {
  // Initialize with default theme (SSR-safe)
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage after mount (client-side only)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored) {
        setTheme(stored);
      }
    }
  }, []);

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    if (!mounted) return; // Skip on server/initial render

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
