import Link from "next/link";
import { ShieldCheck, EyeOff, Map, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";

// ── Inline style helpers for serif wordmark (Palatino/Georgia) ──
const serifStyle: React.CSSProperties = {
  fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  letterSpacing: "0.02em",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ══════════════════════════════════════════
          1. HEADER
      ══════════════════════════════════════════ */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-4 flex items-center justify-between">

          {/* Wordmark block */}
          <BrandMark href="/" />

          {/* Sign-in buttons */}
          <nav className="flex items-center gap-3" aria-label="Authentication">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="focus-visible:ring-2 focus-visible:ring-[#FF7900] focus-visible:ring-offset-2"
              >
                Student Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="sm"
                className="focus-visible:ring-2 focus-visible:ring-[#FF7900] focus-visible:ring-offset-2"
              >
                Administrator Sign In
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
        style={{ backgroundColor: "#FFF4E6", color: "#92400E" }}
      >
        ⚠ This is not an emergency service. In an emergency, dial{" "}
        <strong>911</strong> or CSUF University Police at{" "}
        <a
          href="tel:+16572782515"
          className="font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900] rounded"
          aria-label="Call CSUF University Police at 657-278-2515"
        >
          (657) 278-2515
        </a>
        .
      </div>

      {/* ══════════════════════════════════════════
          3. HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-[80px]">
        <div className="mx-auto max-w-[1280px] px-6 flex flex-col-reverse md:flex-row items-center gap-12">

          {/* Left: copy */}
          <div className="flex-1 space-y-6">
            <h1
              className="font-extrabold text-primary leading-tight"
              style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
            >
              A Safer Campus<br />Starts With You.
            </h1>
            <p className="text-lg text-slate-600" style={{ maxWidth: "540px" }}>
              SafeCampus empowers CSUF students and staff to anonymously report
              safety concerns, track resolutions in real time, and build a more
              transparent, community-driven campus.
            </p>
            <div className="flex flex-row gap-4 flex-wrap">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="focus-visible:ring-2 focus-visible:ring-[#FF7900] focus-visible:ring-offset-2"
                >
                  Create an Account
                </Button>
              </Link>
              <a href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="focus-visible:ring-2 focus-visible:ring-[#FF7900] focus-visible:ring-offset-2"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>

          {/* Right: stylized map mockup SVG */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
            <div
              className="rounded-xl shadow-lg overflow-hidden border border-gray-200"
              style={{ width: "480px", maxWidth: "100%", height: "360px" }}
              aria-label="SafeCampus heat map preview"
              role="img"
            >
              <svg
                viewBox="0 0 480 360"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                aria-hidden="true"
              >
                {/* Grid background */}
                <rect width="480" height="360" fill="#f8fafc" />
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="480" height="360" fill="url(#grid)" />

                {/* Road lines */}
                <line x1="0" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="6" />
                <line x1="240" y1="0" x2="240" y2="360" stroke="#cbd5e1" strokeWidth="6" />
                <line x1="0" y1="90" x2="480" y2="90" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="0" y1="270" x2="480" y2="270" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="120" y1="0" x2="120" y2="360" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="360" y1="0" x2="360" y2="360" stroke="#e2e8f0" strokeWidth="3" />

                {/* Campus building blocks */}
                <rect x="50" y="40" width="60" height="40" rx="4" fill="#e2e8f0" />
                <rect x="160" y="110" width="50" height="50" rx="4" fill="#e2e8f0" />
                <rect x="270" y="40" width="80" height="35" rx="4" fill="#e2e8f0" />
                <rect x="50" y="200" width="55" height="55" rx="4" fill="#e2e8f0" />
                <rect x="300" y="200" width="70" height="45" rx="4" fill="#e2e8f0" />
                <rect x="160" y="290" width="60" height="40" rx="4" fill="#e2e8f0" />
                <rect x="380" y="110" width="60" height="60" rx="4" fill="#e2e8f0" />

                {/* Pin: red (high severity) */}
                <circle cx="130" cy="155" r="14" fill="#DC2626" opacity="0.25" />
                <circle cx="130" cy="155" r="7" fill="#DC2626" />
                <line x1="130" y1="162" x2="130" y2="175" stroke="#DC2626" strokeWidth="2" />

                {/* Pin: orange (medium-high) */}
                <circle cx="310" cy="100" r="14" fill="#FF7900" opacity="0.25" />
                <circle cx="310" cy="100" r="7" fill="#FF7900" />
                <line x1="310" y1="107" x2="310" y2="120" stroke="#FF7900" strokeWidth="2" />

                {/* Pin: yellow (medium) */}
                <circle cx="200" cy="250" r="14" fill="#EAB308" opacity="0.25" />
                <circle cx="200" cy="250" r="7" fill="#EAB308" />
                <line x1="200" y1="257" x2="200" y2="270" stroke="#EAB308" strokeWidth="2" />

                {/* Pin: green (low / resolved) */}
                <circle cx="400" cy="220" r="14" fill="#16A34A" opacity="0.25" />
                <circle cx="400" cy="220" r="7" fill="#16A34A" />
                <line x1="400" y1="227" x2="400" y2="240" stroke="#16A34A" strokeWidth="2" />

                {/* Legend */}
                <rect x="12" y="310" width="200" height="38" rx="6" fill="white" stroke="#e2e8f0" />
                <circle cx="28" cy="329" r="5" fill="#DC2626" />
                <text x="38" y="333" fontSize="10" fill="#475569">High</text>
                <circle cx="72" cy="329" r="5" fill="#FF7900" />
                <text x="82" y="333" fontSize="10" fill="#475569">Med-High</text>
                <circle cx="136" cy="329" r="5" fill="#EAB308" />
                <text x="146" y="333" fontSize="10" fill="#475569">Med</text>
                <circle cx="178" cy="329" r="5" fill="#16A34A" />
                <text x="188" y="333" fontSize="10" fill="#475569">Low</text>

                {/* Label */}
                <rect x="148" y="8" width="184" height="24" rx="4" fill="#00244D" opacity="0.85" />
                <text x="240" y="24" fontSize="12" fill="white" textAnchor="middle" fontWeight="600">
                  SafeCampus Heat Map
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. FEATURES SECTION
      ══════════════════════════════════════════ */}
      <section id="features" className="bg-white border-t border-gray-100 py-[80px]">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-[32px] font-bold text-primary">
              See Something. Say Something. Solve Something.
            </h2>
            <p className="text-lg text-slate-600">
              Four tools that put campus safety in your hands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheck size={32} color="#FF7900" aria-hidden="true" />,
                title: "Verified CSUF Access",
                body: "Only @csu.fullerton.edu accounts can post. Reports you see come from real Titans.",
              },
              {
                icon: <EyeOff size={32} color="#FF7900" aria-hidden="true" />,
                title: "Anonymous Reporting",
                body: "Share sensitive concerns without fear. Your identity stays hidden from the public feed.",
              },
              {
                icon: <Map size={32} color="#FF7900" aria-hidden="true" />,
                title: "Real-Time Heat Map",
                body: "See where incidents cluster across campus, color-coded by severity, updated instantly.",
              },
              {
                icon: <BellRing size={32} color="#FF7900" aria-hidden="true" />,
                title: "Resolution Alerts",
                body: "Get notified the moment facilities or administrators resolve a report you care about.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-3"
              >
                <div>{card.icon}</div>
                <h3 className="text-lg font-bold text-primary">{card.title}</h3>
                <p className="text-sm text-slate-600">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. ABOUT SAFECAMPUS SECTION
      ══════════════════════════════════════════ */}
      <section className="bg-slate-50 border-t border-gray-200 py-[80px]">
        <div className="mx-auto max-w-[1280px] px-6 flex flex-col md:flex-row items-center gap-12">

          {/* Left: CSUF branded gradient block */}
          <div className="flex-shrink-0 flex justify-center">
            <div
              className="w-72 h-48 rounded-xl flex flex-col items-center justify-center gap-1 shadow-md"
              style={{ background: "linear-gradient(135deg, #00244D 60%, #FF7900 100%)" }}
              aria-label="Cal State Fullerton wordmark"
              role="img"
            >
              <span
                style={{
                  ...serifStyle,
                  fontSize: "26px",
                  color: "#F5F0E6",
                  lineHeight: 1.1,
                }}
              >
                Cal State
              </span>
              <span
                style={{
                  ...serifStyle,
                  fontSize: "26px",
                  color: "#FF7900",
                  lineHeight: 1.1,
                }}
              >
                Fullerton
              </span>
            </div>
          </div>

          {/* Right: copy + CTA */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold text-primary">About SafeCampus</h2>
            <p className="text-slate-600 max-w-md">
              SafeCampus is a civic-tech initiative by Cal State Fullerton to make
              campus safety transparent and community-driven. Learn more about our
              mission, policies, and how your reports make a difference.
            </p>
            <a
              href="https://www.fullerton.edu/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit the Cal State Fullerton website (opens in new tab)"
            >
              <Button
                size="md"
                className="bg-accent text-white hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-[#FF7900] focus-visible:ring-offset-2"
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
        <div className="py-8" style={{ backgroundColor: "#00244D" }}>
          <div className="mx-auto max-w-[1280px] px-6 flex flex-col md:flex-row items-start md:items-center gap-6">

            {/* Left: CSUF wordmark */}
            <div className="flex-shrink-0 flex flex-col leading-none">
              <span style={{ ...serifStyle, fontSize: "28px", color: "#F5F0E6" }}>
                Cal State
              </span>
              <span style={{ ...serifStyle, fontSize: "28px", color: "#FF7900" }}>
                Fullerton
              </span>
            </div>

            {/* Right: links + copyright */}
            <div className="flex-1 flex flex-col gap-2 text-sm text-white md:text-right">
              <div className="flex flex-wrap gap-x-3 gap-y-1 md:justify-end text-white/80">
                <a
                  href="https://www.fullerton.edu/contact/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900] rounded"
                  aria-label="Contacts and Addresses (opens in new tab)"
                >
                  Contacts and Addresses
                </a>
                <span aria-hidden="true">|</span>
                <span>
                  General:{" "}
                  <a
                    href="tel:+16572782011"
                    className="underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900] rounded"
                    aria-label="Call CSUF general line at 657-278-2011"
                  >
                    (657) 278-2011
                  </a>
                </span>
                <span aria-hidden="true">|</span>
                <span>
                  Emergency Closure Info:{" "}
                  <a
                    href="tel:+18772781712"
                    className="underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900] rounded"
                    aria-label="Call CSUF emergency closure info at 877-278-1712"
                  >
                    (877) 278-1712
                  </a>
                </span>
                <span aria-hidden="true">|</span>
                <a
                  href="https://www.fullerton.edu/accessibility/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900] rounded"
                  aria-label="Tell us about a web accessibility problem (opens in new tab)"
                >
                  Tell us about a web accessibility problem
                </a>
              </div>

              <p className="text-[13px] text-white/70 md:text-right">
                © 2026 California State University, Fullerton. All Rights Reserved.
              </p>
              <p className="text-[12px] text-gray-300 italic md:text-right max-w-2xl md:ml-auto">
                CSUF events are open to all who are interested or would like to participate,
                regardless of race, sex, color, ethnicity, national origin, or other protected statuses.
              </p>
            </div>
          </div>
        </div>

        {/* TIER 2 — thin dark bar */}
        <div
          className="py-3 px-6"
          style={{ backgroundColor: "#001733" }}
        >
          <div className="mx-auto max-w-[1280px] flex flex-col sm:flex-row items-center justify-between gap-1 text-[12px] text-gray-400">
            <span>SafeCampus — A student project for CPSC 362, Group 8</span>
            <span>Made with care for the CSUF community</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
