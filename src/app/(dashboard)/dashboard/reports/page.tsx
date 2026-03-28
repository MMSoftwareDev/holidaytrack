"use client";

import { useState, useEffect } from "react";
import { BarChart3, Users, Calendar, Clock, Download } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="space-y-5"><Skeleton className="h-8 w-32" /><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div></div>;

  const kpis = [
    { label: "Total Employees", value: "—", icon: Users, color: colors.primary },
    { label: "Requests This Year", value: "—", icon: Calendar, color: colors.accent },
    { label: "Pending Approvals", value: "—", icon: Clock, color: colors.warning },
    { label: "Avg Days Used", value: "—", icon: BarChart3, color: colors.text3 },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>Reports</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              <p className="text-xs font-medium" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>{kpi.label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: kpi.color, fontFamily: "Inter, sans-serif" }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border p-5" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <h2 className="text-sm font-bold mb-2" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>Payroll Export</h2>
          <p className="text-sm mb-4" style={{ color: colors.text2 }}>Export approved holiday requests as a CSV file for payroll processing.</p>
          <Button size="sm" variant="outline" className="gap-1.5"><Download className="w-3.5 h-3.5" /> Export CSV</Button>
        </div>
        <div className="rounded-xl border p-5" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <h2 className="text-sm font-bold mb-2" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>Absence Summary</h2>
          <p className="text-sm mb-4" style={{ color: colors.text2 }}>View a summary of all absences across your organisation.</p>
          <Button size="sm" variant="outline" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> View Report</Button>
        </div>
      </div>
    </div>
  );
}
