import {
  Calendar,
  Shield,
  Users,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Bell,
  FileText,
  Smartphone,
  ChevronRight,
} from "lucide-react";

const brand = {
  purple: "#401D6C",
  purpleLight: "#5A2D96",
  pink: "#EC385D",
  peach: "#FF8073",
  cream: "#FAF7FF",
  surface: "#FFFFFF",
  text: "#1A1225",
  text2: "#5E5470",
  text3: "#8E849A",
  border: "#E8E2F0",
};

function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255,255,255,0.9)",
        borderColor: brand.border,
      }}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${brand.purple}, ${brand.pink})`,
            }}
          >
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "Inter, sans-serif",
              color: brand.purple,
            }}
          >
            HolidayTrack
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Compliance", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium transition-colors duration-150 hover:opacity-80"
              style={{ color: brand.text2, fontFamily: "Inter, sans-serif" }}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium transition-colors duration-150 hover:opacity-80"
            style={{ color: brand.purple, fontFamily: "Inter, sans-serif" }}
          >
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${brand.purple}, ${brand.pink})`,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/4"
        style={{
          background: `radial-gradient(circle, ${brand.pink}, ${brand.peach})`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/4"
        style={{
          background: `radial-gradient(circle, ${brand.purple}, ${brand.pink})`,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="animate-fadeIn inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              backgroundColor: `${brand.pink}12`,
              color: brand.pink,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            Ready for 6 April 2026 regulations
          </div>

          <h1
            className="animate-fadeIn text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6"
            style={{
              fontFamily: "'DM Serif Display', serif",
              color: brand.text,
            }}
          >
            Holiday management
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${brand.purple}, ${brand.pink})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              made simple
            </span>
          </h1>

          <p
            className="animate-fadeIn text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ color: brand.text2 }}
          >
            The easiest way for UK employers to manage holiday requests,
            approvals, and compliance. Built to meet Fair Work Agency
            regulations from day one.
          </p>

          <div className="animate-fadeInUp flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-150 hover:opacity-90 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${brand.purple}, ${brand.pink})`,
                fontFamily: "Inter, sans-serif",
                boxShadow: `0 4px 20px ${brand.purple}30`,
              }}
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold border transition-all duration-150 hover:shadow-sm"
              style={{
                color: brand.purple,
                borderColor: brand.border,
                backgroundColor: brand.surface,
                fontFamily: "Inter, sans-serif",
              }}
            >
              See how it works
            </a>
          </div>

          <p
            className="animate-fadeInUp mt-6 text-sm"
            style={{ color: brand.text3 }}
          >
            Free for small teams. No credit card required.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="animate-fadeInUp mt-16 relative max-w-4xl mx-auto">
          <div
            className="rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              borderColor: brand.border,
              backgroundColor: brand.surface,
              boxShadow: `0 25px 60px ${brand.purple}15`,
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: brand.border, backgroundColor: brand.cream }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <div className="w-3 h-3 rounded-full bg-yellow-300" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
              </div>
              <div
                className="flex-1 mx-4 px-3 py-1 rounded-md text-xs"
                style={{
                  backgroundColor: brand.surface,
                  color: brand.text3,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                app.holidaytrack.co.uk/dashboard
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: brand.text3, fontFamily: "Inter, sans-serif" }}
                  >
                    Good morning,
                  </p>
                  <h2
                    className="text-xl font-bold"
                    style={{ color: brand.text, fontFamily: "Inter, sans-serif" }}
                  >
                    Sarah Johnson
                  </h2>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${brand.purple}, ${brand.pink})`,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Request Holiday
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Remaining", value: "18.5", unit: "days", color: brand.purple },
                  { label: "Used", value: "9.5", unit: "days", color: brand.peach },
                  { label: "Pending", value: "2", unit: "days", color: "#F59E0B" },
                  { label: "Total Allowance", value: "28", unit: "days", color: brand.text3 },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border p-4"
                    style={{ borderColor: brand.border }}
                  >
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: brand.text3, fontFamily: "Inter, sans-serif" }}
                    >
                      {card.label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: card.color, fontFamily: "Inter, sans-serif" }}
                    >
                      {card.value}
                      <span className="text-xs font-medium ml-1" style={{ color: brand.text3 }}>
                        {card.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Calendar,
      title: "Holiday Requests",
      description:
        "Employees request time off in 2 clicks. Auto-calculates working days, excludes bank holidays, and shows remaining balance live.",
    },
    {
      icon: CheckCircle2,
      title: "1-Click Approvals",
      description:
        "Managers see who else is off, approve or decline instantly, and employees get notified by email immediately.",
    },
    {
      icon: Users,
      title: "Team Overview",
      description:
        "See your whole team's availability at a glance. Calendar view, absence patterns, and balance summaries.",
    },
    {
      icon: Shield,
      title: "UK Compliance",
      description:
        "6-year immutable audit trail. Every request, approval, and change recorded with timestamps — ready for Fair Work Agency inspections.",
    },
    {
      icon: BarChart3,
      title: "Reports & Exports",
      description:
        "Payroll-ready CSV exports, absence summaries, carry-forward reports, and Bradford Factor scoring.",
    },
    {
      icon: Bell,
      title: "Email Notifications",
      description:
        "Automatic emails for requests, approvals, declines, and cancellations. Everyone stays in the loop.",
    },
    {
      icon: FileText,
      title: "Entitlement Management",
      description:
        "Pro-rata calculations for mid-year starters, configurable carry-forward caps, and per-employee adjustments.",
    },
    {
      icon: Smartphone,
      title: "Mobile-First",
      description:
        "Employees request holidays from their phones. Managers approve on the go. Works beautifully at any screen size.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p
            className="text-sm font-semibold tracking-wider uppercase mb-3"
            style={{ color: brand.pink, fontFamily: "Inter, sans-serif" }}
          >
            Features
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{
              fontFamily: "'DM Serif Display', serif",
              color: brand.text,
            }}
          >
            Everything you need to manage leave
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: brand.text2 }}>
            From request to approval to payroll export — HolidayTrack handles
            the entire holiday lifecycle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border p-6 transition-all duration-200 hover:shadow-md"
              style={{
                borderColor: brand.border,
                backgroundColor: brand.surface,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${brand.purple}10` }}
              >
                <feature.icon className="w-5 h-5" style={{ color: brand.purple }} />
              </div>
              <h3
                className="text-sm font-bold mb-2"
                style={{ color: brand.text, fontFamily: "Inter, sans-serif" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: brand.text2 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Compliance() {
  const items = [
    "Ordinary annual leave taken per year",
    "Additional annual leave taken per year",
    "Leave carried forward between years",
    "Holiday pay calculation details",
    "Payments in lieu for untaken holiday",
    "Full approval chain with timestamps",
  ];

  return (
    <section id="compliance" className="py-20 md:py-28" style={{ backgroundColor: brand.surface }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p
              className="text-sm font-semibold tracking-wider uppercase mb-3"
              style={{ color: brand.pink, fontFamily: "Inter, sans-serif" }}
            >
              UK Compliance
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "'DM Serif Display', serif", color: brand.text }}
            >
              Ready for 6 April 2026
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: brand.text2 }}>
              New UK regulations require employers to retain 6 years of annual
              leave records, enforced by the Fair Work Agency with unlimited
              fines. HolidayTrack builds compliance into every action.
            </p>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: brand.purple }} />
                  <span className="text-sm" style={{ color: brand.text2 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: brand.border, boxShadow: `0 8px 30px ${brand.purple}08` }}
          >
            <div
              className="px-5 py-3 border-b flex items-center gap-2"
              style={{ borderColor: brand.border, backgroundColor: brand.cream }}
            >
              <Shield className="w-4 h-4" style={{ color: brand.purple }} />
              <span className="text-sm font-semibold" style={{ color: brand.text, fontFamily: "Inter, sans-serif" }}>
                Audit Trail
              </span>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${brand.purple}10`, color: brand.purple, fontFamily: "Inter, sans-serif" }}
              >
                Immutable
              </span>
            </div>
            <div style={{ backgroundColor: brand.surface }}>
              {[
                { action: "Holiday request approved", user: "James Wilson", time: "2 min ago" },
                { action: "Entitlement updated", user: "Admin", time: "1 hour ago" },
                { action: "Holiday request submitted", user: "Sarah Johnson", time: "3 hours ago" },
                { action: "Employee added", user: "Admin", time: "Yesterday" },
                { action: "Holiday request declined", user: "James Wilson", time: "Yesterday" },
              ].map((entry, i) => (
                <div
                  key={i}
                  className="px-5 py-3 border-b last:border-b-0 flex items-center justify-between"
                  style={{ borderColor: brand.border }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: brand.text, fontFamily: "Inter, sans-serif" }}>
                      {entry.action}
                    </p>
                    <p className="text-xs" style={{ color: brand.text3 }}>by {entry.user}</p>
                  </div>
                  <span className="text-xs" style={{ color: brand.text3, fontFamily: "Inter, sans-serif" }}>
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-wider uppercase mb-3" style={{ color: brand.pink, fontFamily: "Inter, sans-serif" }}>
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: "'DM Serif Display', serif", color: brand.text }}>
            Simple, transparent pricing
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: brand.text2 }}>
            Start free and scale as your team grows. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="rounded-2xl border p-8" style={{ borderColor: brand.border, backgroundColor: brand.surface }}>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: brand.text3, fontFamily: "Inter, sans-serif" }}>
              Starter
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: brand.text, fontFamily: "Inter, sans-serif" }}>Free</span>
            </div>
            <p className="text-sm mb-8" style={{ color: brand.text3 }}>For small teams getting started</p>
            <ul className="space-y-3 mb-8">
              {["Up to 10 employees", "Holiday requests & approvals", "Bank holiday auto-detection", "Basic reports", "Email notifications"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm" style={{ color: brand.text2 }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: brand.purple }} />
                  {item}
                </li>
              ))}
            </ul>
            <a href="/signup" className="block w-full py-3 rounded-xl text-center text-sm font-semibold border transition-all duration-150 hover:shadow-sm" style={{ color: brand.purple, borderColor: brand.border, fontFamily: "Inter, sans-serif" }}>
              Get started free
            </a>
          </div>

          <div className="rounded-2xl border-2 p-8 relative" style={{ borderColor: brand.purple, backgroundColor: brand.surface }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: `linear-gradient(135deg, ${brand.purple}, ${brand.pink})`, fontFamily: "Inter, sans-serif" }}>
              Most popular
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: brand.text3, fontFamily: "Inter, sans-serif" }}>Pro</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: brand.text, fontFamily: "Inter, sans-serif" }}>£2</span>
              <span className="text-sm" style={{ color: brand.text3 }}>/employee/month</span>
            </div>
            <p className="text-sm mb-8" style={{ color: brand.text3 }}>For growing businesses</p>
            <ul className="space-y-3 mb-8">
              {["Unlimited employees", "Full compliance audit trail", "Payroll CSV exports", "Team calendar view", "Carry-forward automation", "Priority support"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm" style={{ color: brand.text2 }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: brand.purple }} />
                  {item}
                </li>
              ))}
            </ul>
            <a href="/signup" className="block w-full py-3 rounded-xl text-center text-sm font-semibold text-white transition-all duration-150 hover:opacity-90" style={{ background: `linear-gradient(135deg, ${brand.purple}, ${brand.pink})`, fontFamily: "Inter, sans-serif" }}>
              Start free trial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: brand.surface }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl p-10 md:p-16 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${brand.purple}, ${brand.purpleLight})` }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: brand.pink }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: brand.peach }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Ready to simplify holiday management?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join UK employers who trust HolidayTrack to keep their teams happy and their records compliant.
            </p>
            <a href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-150 hover:opacity-90" style={{ backgroundColor: brand.surface, color: brand.purple, fontFamily: "Inter, sans-serif" }}>
              Get started for free
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-12" style={{ borderColor: brand.border }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${brand.purple}, ${brand.pink})` }}>
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: "Inter, sans-serif", color: brand.purple }}>HolidayTrack</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: brand.text3 }}>
              UK holiday management made simple. Built by{" "}
              <a href="https://intelligentpayroll.co.uk" className="underline hover:opacity-80" style={{ color: brand.text2 }}>Intelligent Payroll</a>.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: brand.text3, fontFamily: "Inter, sans-serif" }}>Product</p>
            <ul className="space-y-2">
              {["Features", "Pricing", "Compliance"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-sm hover:opacity-80 transition-colors duration-150" style={{ color: brand.text2 }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: brand.text3, fontFamily: "Inter, sans-serif" }}>Legal</p>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm hover:opacity-80 transition-colors duration-150" style={{ color: brand.text2 }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: brand.text3, fontFamily: "Inter, sans-serif" }}>Support</p>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hello@holidaytrack.co.uk" className="text-sm hover:opacity-80 transition-colors duration-150" style={{ color: brand.text2 }}>hello@holidaytrack.co.uk</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: brand.border }}>
          <p className="text-xs" style={{ color: brand.text3 }}>&copy; {new Date().getFullYear()} HolidayTrack. All rights reserved.</p>
          <p className="text-xs" style={{ color: brand.text3 }}>A product of Intelligent Payroll Ltd.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Compliance />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
