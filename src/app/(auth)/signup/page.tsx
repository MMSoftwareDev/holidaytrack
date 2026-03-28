"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setError("");
    setLoading(true);

    const supabase = createClient();

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          org_name: data.orgName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user && !authData.session) {
      // Email confirmation required
      setSuccess(true);
      setLoading(false);
      return;
    }

    // If auto-confirmed, create org and employee via API
    if (authData.session) {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          orgName: data.orgName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to set up account");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--brand-purple)10" }}
        >
          <Calendar className="w-6 h-6" style={{ color: "var(--brand-purple)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Inter, sans-serif", color: "var(--brand-text)" }}>
          Check your email
        </h2>
        <p className="text-sm" style={{ color: "var(--brand-text-2)" }}>
          We&apos;ve sent a confirmation link to your email address. Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div>
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

      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Inter, sans-serif", color: "var(--brand-text)" }}>
        Create your account
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--brand-text-2)" }}>
        Start managing your team&apos;s holidays in minutes
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--brand-error)10", color: "var(--brand-error)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" placeholder="Sarah" className="mt-1.5" {...register("firstName")} />
            {errors.firstName && <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" placeholder="Johnson" className="mt-1.5" {...register("lastName")} />
            {errors.lastName && <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="orgName">Organisation name</Label>
          <Input id="orgName" placeholder="Acme Ltd" className="mt-1.5" {...register("orgName")} />
          {errors.orgName && <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>{errors.orgName.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="you@company.co.uk" className="mt-1.5" {...register("email")} />
          {errors.email && <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" className="mt-1.5" {...register("password")} />
          {errors.password && <p className="text-xs mt-1" style={{ color: "var(--brand-error)" }}>{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="text-sm text-center mt-6" style={{ color: "var(--brand-text-2)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-semibold hover:opacity-80" style={{ color: "var(--brand-purple)" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
