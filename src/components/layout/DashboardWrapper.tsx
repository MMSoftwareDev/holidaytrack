"use client";

import type { ReactNode } from "react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";

export function DashboardWrapper({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: colors.cream }}
    >
      <div className="p-4 md:px-6 md:py-6 animate-fadeIn">
        {children}
      </div>
    </main>
  );
}
