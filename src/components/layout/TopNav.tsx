"use client";

import { Menu, Bell } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export function TopNav() {
  const { isDark } = useTheme();
  const { authUser } = useAuth();
  const colors = getThemeColors(isDark);

  const initials = authUser?.employee
    ? `${authUser.employee.first_name[0]}${authUser.employee.last_name[0]}`
    : "?";

  return (
    <header
      className="flex items-center justify-between h-[60px] px-4 md:px-6 border-b md:hidden"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <button className="p-2 rounded-lg" style={{ color: colors.text2 }}>
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg relative" style={{ color: colors.text2 }}>
          <Bell className="w-5 h-5" />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, #EC385D)`, fontFamily: "Inter, sans-serif" }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
