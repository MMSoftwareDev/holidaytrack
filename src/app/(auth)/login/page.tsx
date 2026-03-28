"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div>
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--brand-purple), var(--brand-pink))" }}
        >
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold" style={{ fontFamily: "Inter, sans-serif", color: "var(--brand-purple)" }}>
          HolidayTrack
        </span>
      </div>

      <h2
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: "Inter, sans-serif", color: "var(--brand-text)" }}
      >
        Welcome back
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--brand-text-2)" }}>
        Sign in to your account to continue
      </p>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ backgroundColor: "var(--brand-error)10", color: "var(--brand-error)" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.co.uk"
            className="mt-1.5"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium hover:opacity-80"
              style={{ color: "var(--brand-purple)" }}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="mt-1.5"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="text-sm text-center mt-6" style={{ color: "var(--brand-text-2)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold hover:opacity-80" style={{ color: "var(--brand-purple)" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
