"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Calendar, Loader2 } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useApprovals } from "@/lib/swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateShort } from "@/lib/date-utils";
import { mutate } from "swr";
import type { HolidayRequest } from "@/types/database";

export default function ApprovalsPage() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { data: requests, isLoading } = useApprovals();
  const [mounted, setMounted] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  const handleAction = async (id: string, action: "approve" | "decline", reason?: string) => {
    setActionLoading(id);
    await fetch(`/api/requests/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    mutate("/api/requests?status=pending&role=manager");
    setActionLoading(null);
  };

  const pendingRequests = (requests || []).filter((r: HolidayRequest) => r.status === "pending");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
          Approvals
          {pendingRequests.length > 0 && (
            <Badge variant="pending" className="ml-2">{pendingRequests.length}</Badge>
          )}
        </h1>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}12` }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.text }}>All caught up</p>
          <p className="text-xs" style={{ color: colors.text3 }}>No pending requests to review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((req: HolidayRequest) => (
            <div key={req.id} className="rounded-xl border p-5" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
                    {req.employee?.first_name} {req.employee?.last_name}
                  </p>
                  <p className="text-xs" style={{ color: colors.text3 }}>{req.employee?.email}</p>
                </div>
                <Badge variant="pending">Pending</Badge>
              </div>
              <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: colors.text2 }}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateShort(req.start_date)} — {formatDateShort(req.end_date)}
                </span>
                <span>{req.amount} {req.holiday_unit}</span>
                <span className="capitalize">{req.leave_type}</span>
              </div>
              {req.employee_notes && (
                <p className="text-sm mb-4 p-3 rounded-lg" style={{ color: colors.text2, backgroundColor: colors.cream }}>
                  {req.employee_notes}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleAction(req.id, "approve")}
                  disabled={actionLoading === req.id}
                >
                  {actionLoading === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => handleAction(req.id, "decline")}
                  disabled={actionLoading === req.id}
                  style={{ color: colors.error }}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
