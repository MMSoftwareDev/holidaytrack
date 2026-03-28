"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--brand-success)10" }}>
          <CheckCircle2 className="w-6 h-6" style={{ color: "var(--brand-success)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Inter, sans-serif", color: "var(--brand-text)" }}>Password updated</h2>
        <p className="text-sm" style={{ color: "var(--brand-text-2)" }}>Redirecting you to the dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Inter, sans-serif", color: "var(--brand-text)" }}>Set new password</h2>
      <p className="text-sm mb-8" style={{ color: "var(--brand-text-2)" }}>Enter your new password below.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--brand-error)10", color: "var(--brand-error)" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" className="mt-1.5" {...register("password")} />
          {errors.password && <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" placeholder="Confirm your password" className="mt-1.5" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </div>
  );
}
