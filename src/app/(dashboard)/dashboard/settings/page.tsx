"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTheme, getThemeColors } from "@/contexts/ThemeContext";
import { useSettings } from "@/lib/swr";
import { orgSettingsSchema, type OrgSettingsInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { mutate } from "swr";

export default function SettingsPage() {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { data: org, isLoading } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<OrgSettingsInput>({
    resolver: zodResolver(orgSettingsSchema),
  });

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (org) reset(org); }, [org, reset]);

  if (!mounted || isLoading) return <div className="space-y-5"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 rounded-xl" /></div>;

  const onSubmit = async (data: OrgSettingsInput) => {
    setSaving(true);
    setSuccess(false);
    await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    mutate("/api/settings");
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text, fontFamily: "Inter, sans-serif" }}>Organisation Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div>
            <Label>Organisation name</Label>
            <Input className="mt-1.5" {...register("name")} />
            {errors.name && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Holiday year start month</Label>
              <select className="flex h-10 w-full rounded-lg border px-3 py-2 text-sm mt-1.5" style={{ borderColor: colors.border }} {...register("holiday_year_start_month")}>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString("en-GB", { month: "long" })}</option>)}
              </select>
            </div>
            <div>
              <Label>Start day</Label>
              <Input type="number" min={1} max={31} className="mt-1.5" {...register("holiday_year_start_day")} />
            </div>
          </div>
          <div>
            <Label>Default holiday unit</Label>
            <select className="flex h-10 w-full rounded-lg border px-3 py-2 text-sm mt-1.5" style={{ borderColor: colors.border }} {...register("default_holiday_unit")}>
              <option value="days">Days</option>
              <option value="hours">Hours</option>
            </select>
          </div>
          <div>
            <Label>Bank holiday region</Label>
            <select className="flex h-10 w-full rounded-lg border px-3 py-2 text-sm mt-1.5" style={{ borderColor: colors.border }} {...register("bank_holiday_region")}>
              <option value="england_wales">England & Wales</option>
              <option value="scotland">Scotland</option>
              <option value="northern_ireland">Northern Ireland</option>
            </select>
          </div>
          <div>
            <Label>Carry forward cap (days)</Label>
            <Input type="number" min={0} step={0.5} className="mt-1.5" {...register("carry_forward_cap")} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
          {success && <span className="text-sm" style={{ color: colors.success }}>Settings saved</span>}
        </div>
      </form>
    </div>
  );
}
