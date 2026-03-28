"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--brand-purple)10" }}>
          <Mail className="w-6 h-6" style={{ color: "var(--brand-purple)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Inter, sans-serif", color: "var(--brand-text)" }}>Check your email</h2>
        <p className="text-sm mb-6" style={{ color: "var(--brand-text-2)" }}>
          If an account exists with that email, we&apos;ve sent password reset instructions.
        </p>
        <Link href="/login" className="text-sm font-semibold hover:opacity-80" style={{ color: "var(--brand-purple)" }}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium mb-8 hover:opacity-80" style={{ color: "var(--brand-purple)" }}>
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>

      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Inter, sans-serif", color: "var(--brand-text)" }}>Reset your password</h2>
      <p className="text-sm mb-8" style={{ color: "var(--brand-text-2)" }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--brand-error)10", color: "var(--brand-error)" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="you@company.co.uk" className="mt-1.5" {...register("email")} />
          {errors.email && <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
    </div>
  );
}
