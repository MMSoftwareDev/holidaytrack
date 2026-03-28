"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useRequests } from "@/lib/swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateShort, formatRelative } from "@/lib/date-utils";
import type { HolidayRequest } from "@/types/database";

export default function RequestsPage() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { data: requests, isLoading } = useRequests();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const filteredRequests = (requests || []).filter((r: HolidayRequest) =>
    filter === "all" ? true : r.status === filter
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>My Requests</h1>
        <Link href="/dashboard/requests/new">
          <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> New Request</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "declined", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
            style={{
              fontFamily: "Inter, sans-serif",
              backgroundColor: filter === s ? `${colors.primary}10` : "transparent",
              color: filter === s ? colors.primary : colors.text3,
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}12` }}>
              <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <p className="text-sm font-medium" style={{ color: colors.text }}>No requests found</p>
            <p className="text-xs" style={{ color: colors.text3 }}>
              {filter === "all" ? "You haven't made any requests yet." : `No ${filter} requests.`}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: colors.cream }}>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Dates</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3 hidden sm:table-cell" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Amount</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Type</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Status</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3 hidden sm:table-cell" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req: HolidayRequest) => (
                <tr key={req.id} className="border-t hover:opacity-80 transition-colors duration-150" style={{ borderColor: colors.border }}>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>{formatDateShort(req.start_date)} — {formatDateShort(req.end_date)}</td>
                  <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: colors.text2 }}>{req.amount} {req.holiday_unit}</td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell capitalize" style={{ color: colors.text2 }}>{req.leave_type}</td>
                  <td className="px-4 py-3"><Badge variant={req.status as "pending" | "approved" | "declined" | "cancelled"}>{req.status}</Badge></td>
                  <td className="px-4 py-3 text-xs hidden sm:table-cell" style={{ color: colors.text3 }}>{formatRelative(req.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
