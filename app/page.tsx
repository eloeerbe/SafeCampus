"use client";

import Link from "next/link";
import { Map, EyeOff, Bell, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";

// ── Serif style for CSUF co-brand ──────────────────────────────────────────
const serifStyle: React.CSSProperties = {
  fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  letterSpacing: "0.02em",
};

// ── Live-feed preview data ─────────────────────────────────────────────────
const liveFeedReports = [
  {
    id: 1,
    title: "Suspicious individual",
    location: "Langsdorf Hall",
    category: "Safety",
    severity: "Critical",
    status: "Open",
  },
  {
    id: 2,
    title: "Water leak",
    location: "Titan Student Union",
    category: "Maintenance",
    severity: "Medium",
    status: "Open",
  },
  {
    id: 3,
    title: "Cracked sidewalk",
    location: "Nutwood Parking",
    category: "Maintenance",
    severity: "Low",
    status: "Resolved",
  },
];

// ── Badge colour helpers ───────────────────────────────────────────────────
function categoryStyle(cat: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    Safety:      { background: "rgba(239,68,68,0.15)",  color: "#fca5a5" },
    Maintenance: { background: "rgba(234,179,8,0.15)",  color: "#fde047" },
    Accident:    { background: "rgba(249,115,22,0.15)", color: "#fdba74" },
    "Lost & Found": { background: "rgba(99,102,241,0.15)", color: "#a5b4fc" },
    Other:       { background: "rgba(148,163,184,0.15)", color: "#94a3b8" },
  };
  return map[cat] ?? map["Other"];
}

function severityStyle(sev: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    Critical: { background: "rgba(239,68,68,0.2)",   color: "#f87171", border: "1px solid rgba(239,68,68,0.4)" },
    High:     { background: "rgba(249,115,22,0.2)",  color: "#fb923c", border: "1px solid rgba(249,115,22,0.4)" },
    Medium:   { background: "rgba(234,179,8,0.2)",   color: "#facc15", border: "1px solid rgba(234,179,8,0.4)" },
    Low:      { background: "rgba(34,197,94,0.2)",   color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)" },
  };
  return map[sev] ?? {};
}

function statusStyle(st: string): React.CSSProperties {
  if (st === "Resolved") return { background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)" };
  if (st === "In Progress") return { background: "rgba(234,179,8,0.2)", color: "#facc15", border: "1px solid rgba(234,179,8,0.4)" };
  return { background: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.3)" };
}

// ── Pill component ─────────────────────────────────────────────────────────
function Pill({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <span
      style={{
        ...style,
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ── Category icon emoji map ────────────────────────────────────────────────
const categoryIcon: Record<string, string> = {
  Safety: "🛡️",
  Maintenance: "🔧",
  Accident: "⚠️",
  "Lost & Found": "🎒",
  Other: "📋",
};

// ── Stat counters ──────────────────────────────────────────────────────────
const stats = [
  { value: "14", label: "Active reports" },
  { value: "2",  label: "Resolved this week" },
  { value: "200+", label: "Students protected" },
];

// ── Feature cards ──────────────────────────────────────────────────────────
const features = [
  {
    icon: <Map size={28} aria-hidden="true" />,
    title: "Live Map",
    body: "View and filter incidents by location across the CSUF campus in real time.",
  },
  {
    icon: <EyeOff size={28} aria-hidden="true" />,
    title: "Anonymous Reports",
    body: "Submit reports without revealing your identity — your safety matters.",
  },
  {
    icon: <Bell size={28} aria-hidden="true" />,
    title: "Smart Alerts",
    body: "Get notified by category — Safety, Maintenance, Accidents, and more.",
  },
  {
    icon: <LayoutDashboard size={28} aria-hidden="true" />,
    title: "Admin Dashboard",
    body: "Track, prioritize, and resolve reports with a full admin control panel.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0C2340" }}>

      {/* ══════════════════════════════════════════
          KEYFRAME ANIMATIONS (injected once)
      ══════════════════════════════════════════ */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          1. GLASSMORPHIC HEADER
      ══════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(12,35,64,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-6 py-4 flex items-center justify-between">
          <BrandMark href="/" />

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Site navigation">
            {["Features", "Map", "About"].map((label) => (
              <a
                key={label}
                href={label === "Features" ? "#features" : label === "Map" ? "/map" : "#about"}
                className="transition-colors"
                style={{ color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Auth buttons */}
          <nav className="flex items-center gap-3" aria-label="Authentication">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                style={{
                  borderColor: "rgba(255,255,255,0.25)",
                  color: "#fff",
                  background: "transparent",
                }}
                className="hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#E85D26] focus-visible:ring-offset-2"
              >
                Student sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="sm"
                style={{ background: "#E85D26", color: "#fff", border: "none" }}
                className="hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#E85D26] focus-visible:ring-offset-2"
              >
                Admin sign in
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          2. EMERGENCY NOTICE BAR
      ══════════════════════════════════════════ */}
      <div
        role="alert"
        className="w-full text-center text-sm px-4 py-[10px]"
        style={{ backgroundColor: "#1a3a5c", color: "#fbbf24", borderBottom: "1px solid rgba(251,191,36,0.2)" }}
      >
        ⚠ This is not an emergency service. In an emergency, dial{" "}
        <strong>911</strong> or CSUF University Police at{" "}
        <a
          href="tel:+16572782515"
          className="font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D26] rounded"
          aria-label="Call CSUF University Police at 657-278-2515"
        >
          (657) 278-2515
        </a>
        .
      </div>

      {/* ══════════════════════════════════════════
          3. HERO SECTION — animated gradient bg
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 md:py-[96px]"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, #1e3a6e 0%, #0C2340 45%, #1a1040 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 12s ease infinite",
        }}
      >
        {/* Decorative radial glow blobs */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "-80px", left: "-80px",
            width: "480px", height: "480px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,93,38,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute", bottom: "-60px", right: "-60px",
            width: "400px", height: "400px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative mx-auto max-w-[1280px] px-6 flex flex-col-reverse md:flex-row items-center gap-12">

          {/* ── Left: copy ── */}
          <div
            className="flex-1 space-y-6"
            style={{ animation: "fadeSlideUp 0.7s ease both" }}
          >
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#E85D26",
                  display: "inline-block",
                  animation: "pulseDot 2s ease-in-out infinite",
                }}
              />
              Live campus safety reporting
            </div>

            <h1
              className="font-extrabold leading-tight"
              style={{ fontSize: "clamp(32px, 5vw, 52px)", color: "#fff" }}
            >
              A safer campus<br />
              starts with{" "}
              <span style={{ color: "#E85D26" }}>you.</span>
            </h1>

            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.65)", maxWidth: "500px", lineHeight: 1.65 }}>
              Report safety concerns anonymously, track resolutions in real time,
              and build a more transparent campus community.
            </p>

            {/* CTAs */}
            <div className="flex flex-row gap-4 flex-wrap">
              <Link href="/signup">
                <Button
                  size="lg"
                  style={{ background: "#E85D26", color: "#fff", border: "none" }}
                  className="hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#E85D26] focus-visible:ring-offset-2"
                >
                  Create an account
                </Button>
              </Link>
              <Link href="/map">
                <Button
                  variant="outline"
                  size="lg"
                  style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff", background: "transparent" }}
                  className="hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#E85D26] focus-visible:ring-offset-2"
                >
                  View the map
                </Button>
              </Link>
            </div>

            {/* ── Stat counters ── */}
            <div className="flex items-center gap-0 pt-2 flex-wrap">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center">
                  <div className="px-5 first:pl-0 text-center md:text-left">
                    <div className="text-2xl font-extrabold" style={{ color: "#fff" }}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
                  </div>
                  {i < stats.length - 1 && (
                    <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.15)" }} aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: live-feed preview card ── */}
          <div
            className="flex-shrink-0 w-full md:w-auto flex justify-center"
            style={{ animation: "fadeSlideUp 0.9s ease both" }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                width: "420px",
                maxWidth: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
              }}
              aria-label="Live campus safety feed preview"
            >
              {/* Card header */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              >
                {/* macOS-style traffic lights */}
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
                <span className="ml-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Live feed — CSUF Campus
                </span>
              </div>

              {/* Report rows */}
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {liveFeedReports.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Category icon */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-lg text-lg"
                      style={{ width: 38, height: 38, background: "rgba(255,255,255,0.06)" }}
                      aria-hidden="true"
                    >
                      {categoryIcon[r.category] ?? "📋"}
                    </div>

                    {/* Title + location */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "#fff" }}>{r.title}</div>
                      <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{r.location}</div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Pill label={r.severity} style={severityStyle(r.severity)} />
                      <Pill label={r.status}   style={statusStyle(r.status)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Card footer — mini stat row */}
              <div
                className="grid grid-cols-3 divide-x text-center py-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                {[
                  { val: "10", label: "Open",        color: "#94a3b8" },
                  { val: "2",  label: "In progress",  color: "#facc15" },
                  { val: "2",  label: "Resolved",     color: "#4ade80" },
                ].map((s) => (
                  <div key={s.label} style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="text-base font-bold" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. FEATURES GRID
      ══════════════════════════════════════════ */}
      <section
        id="features"
        className="py-[80px]"
        style={{ background: "#0d1f38", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-[1280px] px-6">
          {/* Section label */}
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#E85D26" }}>
            Four core tools
          </p>
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: "#fff" }}>
            See something. Say something. Solve something.
          </h2>
          <p className="mb-12" style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>
            Everything you need to keep campus safe, in one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((card) => (
              <div
                key={card.title}
                className="rounded-xl p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Icon container */}
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 48, height: 48, background: "rgba(232,93,38,0.15)", color: "#E85D26" }}
                >
                  {card.icon}
                </div>
                <h3 className="text-base font-bold" style={{ color: "#fff" }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. ABOUT SAFECAMPUS SECTION
      ══════════════════════════════════════════ */}
      <section
        id="about"
        className="py-[80px]"
        style={{ background: "#0C2340", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-[1280px] px-6 flex flex-col md:flex-row items-center gap-12">

          {/* CSUF branded block */}
          <div className="flex-shrink-0 flex justify-center">
            <div
              className="w-72 h-48 rounded-xl flex flex-col items-center justify-center gap-1 shadow-md"
              style={{ background: "linear-gradient(135deg, #0C2340 60%, #E85D26 100%)" }}
              aria-label="Cal State Fullerton wordmark"
              role="img"
            >
              <span style={{ ...serifStyle, fontSize: "26px", color: "#F5F0E6", lineHeight: 1.1 }}>Cal State</span>
              <span style={{ ...serifStyle, fontSize: "26px", color: "#E85D26", lineHeight: 1.1 }}>Fullerton</span>
            </div>
          </div>

          {/* Copy */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>About SafeCampus</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", maxWidth: "480px" }}>
              SafeCampus is a civic-tech initiative by Cal State Fullerton to make campus safety
              transparent and community-driven. Learn more about our mission, policies, and how
              your reports make a difference.
            </p>
            <a
              href="https://www.fullerton.edu/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit the Cal State Fullerton website (opens in new tab)"
            >
              <Button
                size="sm"
                style={{ background: "#E85D26", color: "#fff", border: "none" }}
                className="hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#E85D26] focus-visible:ring-offset-2"
              >
                Visit CSUF
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. FOOTER — TIER 1
      ══════════════════════════════════════════ */}
      <footer>
        <div className="py-8" style={{ backgroundColor: "#071526" }}>
          <div className="mx-auto max-w-[1280px] px-6 flex flex-col md:flex-row items-start md:items-center gap-6">

            <div className="flex-shrink-0 flex flex-col leading-none">
              <span style={{ ...serifStyle, fontSize: "28px", color: "#F5F0E6" }}>Cal State</span>
              <span style={{ ...serifStyle, fontSize: "28px", color: "#E85D26" }}>Fullerton</span>
            </div>

            <div className="flex-1 flex flex-col gap-2 text-sm text-white md:text-right">
              <div className="flex flex-wrap gap-x-3 gap-y-1 md:justify-end" style={{ color: "rgba(255,255,255,0.6)" }}>
                <a href="https://www.fullerton.edu/contact/" target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D26] rounded"
                  aria-label="Contacts and Addresses (opens in new tab)">
                  Contacts and Addresses
                </a>
                <span aria-hidden="true">|</span>
                <span>General: <a href="tel:+16572782011" className="underline hover:text-white">(657) 278-2011</a></span>
                <span aria-hidden="true">|</span>
                <span>Emergency Closure: <a href="tel:+18772781712" className="underline hover:text-white">(877) 278-1712</a></span>
                <span aria-hidden="true">|</span>
                <a href="https://www.fullerton.edu/accessibility/" target="_blank" rel="noopener noreferrer"
                  className="underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D26] rounded"
                  aria-label="Tell us about a web accessibility problem (opens in new tab)">
                  Accessibility
                </a>
              </div>
              <p className="text-[13px] md:text-right" style={{ color: "rgba(255,255,255,0.4)" }}>
                © 2026 California State University, Fullerton. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>

        <div className="py-3 px-6" style={{ backgroundColor: "#040e1a" }}>
          <div className="mx-auto max-w-[1280px] flex flex-col sm:flex-row items-center justify-between gap-1 text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>SafeCampus — A student project for CPSC 362, Group 8</span>
            <span>Made with care for the CSUF community</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
