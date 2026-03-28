"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useAuditLog } from "@/lib/swr";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/lib/date-utils";
import type { AuditLogEntry } from "@/types/database";

export default function AuditLogPage() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { data: entries, isLoading } = useAuditLog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) return <div className="space-y-5"><Skeleton className="h-8 w-32" /><Skeleton className="h-96 rounded-xl" /></div>;

  const logs: AuditLogEntry[] = entries || [];

  return (
    <div className="space-y-5">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>Audit Log</h1>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}12` }}>
              <FileText className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <p className="text-sm font-medium" style={{ color: colors.text }}>No audit entries yet</p>
            <p className="text-xs" style={{ color: colors.text3 }}>Actions will be recorded here automatically</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: colors.cream }}>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Time</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Action</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3 hidden sm:table-cell" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Entity</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry) => (
                <tr key={entry.id} className="border-t" style={{ borderColor: colors.border }}>
                  <td className="px-4 py-3 text-xs" style={{ color: colors.text3 }}>{formatRelative(entry.created_at)}</td>
                  <td className="px-4 py-3 text-sm font-medium capitalize" style={{ color: colors.text }}>{entry.action}</td>
                  <td className="px-4 py-3 text-sm hidden sm:table-cell capitalize" style={{ color: colors.text2 }}>{entry.entity_type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-xs font-mono hidden md:table-cell" style={{ color: colors.text3 }}>{entry.entity_id?.substring(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
