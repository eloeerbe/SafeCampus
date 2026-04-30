"use client";

import Link from "next/link";
import Image from "next/image";

const serifStyle: React.CSSProperties = {
  fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  letterSpacing: "0.02em",
};

type Props = {
  href?: string;
  className?: string;
  /**
   * "dark"  — white wordmark for dark/navy backgrounds (landing page, glassmorphic nav)
   * "light" — navy wordmark for light/white backgrounds (authenticated app nav)
   */
  variant?: "dark" | "light";
};

export function BrandMark({ href = "/", className = "", variant = "dark" }: Props) {
  const nameColor = variant === "dark" ? "#fff"                  : "#00244D";
  const subColor  = variant === "dark" ? "rgba(255,255,255,0.7)" : "#00244D";

  return (
    <Link href={href} className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo icon — hard hat is orange in the SVG itself */}
      <div className="flex-shrink-0">
        <Image
          src="/logo.svg"
          alt="SafeCampus logo — Tuffy the Titan elephant wearing a safety hardhat"
          width={40}
          height={40}
          className="rounded-md"
          priority
        />
      </div>

      {/* Text wordmark */}
      <div className="flex flex-col leading-tight">
        <span className="text-xl font-bold tracking-tight" style={{ color: nameColor }}>
          SafeCampus
        </span>
        <span style={{ ...serifStyle, fontSize: "11px" }}>
          <span style={{ color: subColor }}>Cal State </span>
          <span style={{ color: "#E85D26" }}>Fullerton</span>
        </span>
      </div>
    </Link>
  );
}
