import type { ReactNode } from "react";
import { Calendar } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--brand-cream)" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--brand-purple), #5A2D96)",
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "var(--brand-pink)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "var(--brand-peach)" }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: "Inter, sans-serif" }}>
              HolidayTrack
            </span>
          </div>
          <h1
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Holiday management,
            <br />
            simplified.
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Manage employee holiday requests, approvals, and UK compliance — all in one place.
          </p>
        </div>

        <p className="relative text-sm text-white/50">
          &copy; {new Date().getFullYear()} HolidayTrack. A product of Intelligent Payroll Ltd.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
