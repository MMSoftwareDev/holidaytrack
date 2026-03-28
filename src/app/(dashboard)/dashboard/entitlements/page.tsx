"use client";

import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useEntitlements } from "@/lib/swr";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateShort } from "@/lib/date-utils";

interface EntitlementWithEmployee {
  id: string;
  employee_id: string;
  year_start: string;
  year_end: string;
  total_ordinary: number;
  total_additional: number;
  used_ordinary: number;
  used_additional: number;
  pending_ordinary: number;
  pending_additional: number;
  carried_forward: number;
  employee?: { first_name: string; last_name: string; email: string };
}

export default function EntitlementsPage() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [mounted, setMounted] = useState(false);
  const { data: entitlements, isLoading } = useEntitlements();

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const items: EntitlementWithEmployee[] = entitlements || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
        Entitlements
      </h1>

      {items.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div
            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: `${colors.primary}12` }}
          >
            <BarChart3 className="w-6 h-6" style={{ color: colors.primary }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
            No entitlements found
          </p>
          <p className="text-xs" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>
            Entitlements will appear here once employees are added
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.border }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB" }}>
                  {["Employee", "Year", "Ordinary", "Additional", "Used", "Pending", "Carried Forward"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3"
                      style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((ent) => (
                  <tr
                    key={ent.id}
                    className="border-b last:border-b-0 transition-colors duration-150"
                    style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
                        {ent.employee ? `${ent.employee.first_name} ${ent.employee.last_name}` : ent.employee_id}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: colors.text2, fontFamily: "Inter, sans-serif" }}>
                        {formatDateShort(ent.year_start)} — {formatDateShort(ent.year_end)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
                        {ent.total_ordinary}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
                        {ent.total_additional}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: colors.accent, fontFamily: "Inter, sans-serif" }}>
                        {ent.used_ordinary + ent.used_additional}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: colors.warning, fontFamily: "Inter, sans-serif" }}>
                        {ent.pending_ordinary + ent.pending_additional}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: colors.text2, fontFamily: "Inter, sans-serif" }}>
                        {ent.carried_forward}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
