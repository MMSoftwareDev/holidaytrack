"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  cream: string;
  text: string;
  text2: string;
  text3: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const lightColors: ThemeColors = {
  primary: "#401D6C",
  secondary: "#EC385D",
  accent: "#FF8073",
  surface: "#FFFFFF",
  cream: "#FAF7FF",
  text: "#1A1225",
  text2: "#5E5470",
  text3: "#8E849A",
  border: "#E8E2F0",
  success: "#188038",
  warning: "#F59E0B",
  error: "#D93025",
};

const darkColors: ThemeColors = {
  primary: "#7C5CBF",
  secondary: "#F06082",
  accent: "#FFA599",
  surface: "#1A1B2E",
  cream: "#0F0F23",
  text: "#F1F5F9",
  text2: "#CBD5E1",
  text3: "#64748B",
  border: "rgba(255,255,255,0.08)",
  success: "#10B981",
  warning: "#FBBF24",
  error: "#EF4444",
};

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? darkColors : lightColors;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("ht_theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ht_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
