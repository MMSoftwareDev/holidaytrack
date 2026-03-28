"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/lib/swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateShort, formatRelative } from "@/lib/date-utils";

export default function DashboardPage() {
  const { isDark } = useTheme();
  const { authUser } = useAuth();
  const colors = getThemeColors(isDark);
  const [mounted, setMounted] = useState(false);
  const { data, isLoading } = useCurrentUser();

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const employee = authUser?.employee;
  const entitlement = data?.entitlement;
  const requests = data?.recentRequests || [];
  const greeting = getGreeting();

  const remaining = entitlement
    ? (entitlement.total_ordinary + entitlement.total_additional + entitlement.carried_forward) -
      (entitlement.used_ordinary + entitlement.used_additional) -
      (entitlement.pending_ordinary + entitlement.pending_additional)
    : 0;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm font-medium" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>
          {greeting},
        </p>
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
          {employee?.first_name} {employee?.last_name}
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard colors={colors} label="Remaining" value={remaining} color={colors.primary} />
        <KPICard colors={colors} label="Used" value={(entitlement?.used_ordinary || 0) + (entitlement?.used_additional || 0)} color={colors.accent} />
        <KPICard colors={colors} label="Pending" value={(entitlement?.pending_ordinary || 0) + (entitlement?.pending_additional || 0)} color={colors.warning} />
        <KPICard colors={colors} label="Total Allowance" value={(entitlement?.total_ordinary || 28) + (entitlement?.total_additional || 0) + (entitlement?.carried_forward || 0)} color={colors.text3} />
      </div>

      {/* Quick action */}
      <Link href="/dashboard/requests/new">
        <Button size="lg" className="gap-2">
          <Calendar className="w-4 h-4" />
          Request Holiday
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>

      {/* Recent Requests */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
          <h2 className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
            Recent Requests
          </h2>
          <Link href="/dashboard/requests" className="text-xs font-medium hover:opacity-80" style={{ color: colors.primary }}>
            View all
          </Link>
        </div>
        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}12` }}>
              <Clock className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <p className="text-sm font-medium" style={{ color: colors.text }}>No requests yet</p>
            <p className="text-xs" style={{ color: colors.text3 }}>Your holiday requests will appear here</p>
          </div>
        ) : (
          <div>
            {requests.map((req: { id: string; start_date: string; end_date: string; amount: number; status: string; created_at: string }) => (
              <div key={req.id} className="px-5 py-3 border-b last:border-b-0 flex items-center justify-between" style={{ borderColor: colors.border }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
                    {formatDateShort(req.start_date)} — {formatDateShort(req.end_date)}
                  </p>
                  <p className="text-xs" style={{ color: colors.text3 }}>
                    {req.amount} days &middot; {formatRelative(req.created_at)}
                  </p>
                </div>
                <Badge variant={req.status as "pending" | "approved" | "declined" | "cancelled"}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ colors, label, value, color }: { colors: ReturnType<typeof getThemeColors>; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      <p className="text-xs font-medium mb-1" style={{ color: colors.text3, fontFamily: "Inter, sans-serif" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color, fontFamily: "Inter, sans-serif" }}>
        {value}
        <span className="text-xs font-medium ml-1" style={{ color: colors.text3 }}>days</span>
      </p>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
