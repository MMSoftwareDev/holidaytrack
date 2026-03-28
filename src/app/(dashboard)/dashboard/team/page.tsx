"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useTeam } from "@/lib/swr";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee } from "@/types/database";

export default function TeamPage() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { data: employees, isLoading } = useTeam();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return <div className="space-y-5"><Skeleton className="h-8 w-32" /><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div></div>;
  }

  const team: Employee[] = employees || [];

  return (
    <div className="space-y-5">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>Team Overview</h1>

      {team.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}12` }}>
            <Users className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.text }}>No team members</p>
          <p className="text-xs" style={{ color: colors.text3 }}>Add employees to see your team here</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {team.map((emp) => (
            <div key={emp.id} className="rounded-xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, #EC385D)` }}>
                  {emp.first_name[0]}{emp.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>{emp.first_name} {emp.last_name}</p>
                  <p className="text-xs capitalize" style={{ color: colors.text3 }}>{emp.role.replace("_", " ")}</p>
                </div>
              </div>
              <Badge variant={emp.is_active ? "approved" : "cancelled"}>
                {emp.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
