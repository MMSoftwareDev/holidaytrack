"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { holidayRequestSchema, type HolidayRequestInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewRequestPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<HolidayRequestInput>({
    resolver: zodResolver(holidayRequestSchema),
    defaultValues: { leave_type: "ordinary" },
  });

  useEffect(() => setMounted(true), []);

  if (!mounted) return <Skeleton className="h-64 rounded-xl" />;

  const onSubmit = async (data: HolidayRequestInput) => {
    setError("");
    setLoading(true);

    // Simple working days calculation (weekdays between dates)
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    let workingDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) workingDays++;
      current.setDate(current.getDate() + 1);
    }

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        amount: workingDays,
        holiday_unit: "days",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to submit request");
      setLoading(false);
      return;
    }

    router.push("/dashboard/requests");
  };

  return (
    <div className="max-w-xl">
      <Link href="/dashboard/requests" className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:opacity-80" style={{ color: colors.primary }}>
        <ArrowLeft className="w-4 h-4" /> Back to requests
      </Link>

      <h1 className="text-xl md:text-2xl font-bold mb-6" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>
        Request Holiday
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: `${colors.error}10`, color: colors.error }}>{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" className="mt-1.5" {...register("start_date")} />
              {errors.start_date && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.start_date.message}</p>}
            </div>
            <div>
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" type="date" className="mt-1.5" {...register("end_date")} />
              {errors.end_date && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.end_date.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="leave_type">Leave type</Label>
            <select
              id="leave_type"
              className="flex h-10 w-full rounded-lg border px-3 py-2 text-sm mt-1.5"
              style={{ borderColor: colors.border, fontFamily: "Inter, sans-serif" }}
              {...register("leave_type")}
            >
              <option value="ordinary">Ordinary</option>
              <option value="additional">Additional</option>
            </select>
          </div>

          <div>
            <Label htmlFor="employee_notes">Notes (optional)</Label>
            <textarea
              id="employee_notes"
              rows={3}
              className="flex w-full rounded-lg border px-3 py-2 text-sm mt-1.5 resize-none"
              style={{ borderColor: colors.border, fontFamily: "Inter, sans-serif" }}
              placeholder="Any additional notes for your manager..."
              {...register("employee_notes")}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Request
          </Button>
          <Link href="/dashboard/requests">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
