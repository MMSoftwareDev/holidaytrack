"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { DashboardWrapper } from "@/components/layout/DashboardWrapper";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopNav />
            <DashboardWrapper>{children}</DashboardWrapper>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
