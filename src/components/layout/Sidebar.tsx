"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  CalendarPlus,
  CheckSquare,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  FileText,
  UsersRound,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Requests", href: "/dashboard/requests", icon: CalendarPlus },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Approvals", href: "/dashboard/approvals", icon: CheckSquare, roles: ["manager", "admin", "super_admin"] },
      { label: "Team", href: "/dashboard/team", icon: UsersRound },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Employees", href: "/dashboard/employees", icon: Users, roles: ["admin", "super_admin"] },
      { label: "Entitlements", href: "/dashboard/entitlements", icon: BookOpen, roles: ["admin", "super_admin"] },
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["admin", "super_admin"] },
      { label: "Audit Log", href: "/dashboard/audit-log", icon: FileText, roles: ["admin", "super_admin"] },
      { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin", "super_admin"] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const { authUser, signOut } = useAuth();
  const colors = getThemeColors(isDark);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navSections.forEach((section) => {
      const isActive = section.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
      initial[section.label] = isActive || section.label === "Overview";
    });
    return initial;
  });

  const userRole = authUser?.employee?.role || "employee";

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className="hidden md:flex flex-col w-[252px] h-screen border-r flex-shrink-0"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-[60px] border-b" style={{ borderColor: colors.border }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, #EC385D)` }}
        >
          <Calendar className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight" style={{ fontFamily: "Inter, sans-serif", color: colors.primary }}>
          HolidayTrack
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.includes(userRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label} className="mb-1">
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg hover:opacity-80"
                style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}
              >
                {section.label}
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200"
                  style={{ transform: openSections[section.label] ? "rotate(0deg)" : "rotate(-90deg)" }}
                />
              </button>

              {openSections[section.label] && (
                <div className="mt-0.5 space-y-0.5 pl-2">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          color: isActive ? colors.primary : colors.text2,
                          backgroundColor: isActive ? `${colors.primary}10` : "transparent",
                        }}
                      >
                        <item.icon className="w-[18px] h-[18px]" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 space-y-1" style={{ borderColor: colors.border }}>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:opacity-80"
          style={{ color: colors.text2, fontFamily: "Inter, sans-serif" }}
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:opacity-80"
          style={{ color: colors.text2, fontFamily: "Inter, sans-serif" }}
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
