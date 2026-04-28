"use client";

import Link from "next/link";
import Image from "next/image";

// Serif style matches the landing page co-brand line exactly
const serifStyle: React.CSSProperties = {
  fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  letterSpacing: "0.02em",
};

type Props = { href?: string; className?: string };

export function BrandMark({ href = "/", className = "" }: Props) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo icon */}
      <Image
        src="/logo.svg"
        alt="SafeCampus logo — Tuffy the Titan elephant wearing a safety hardhat"
        width={40}
        height={40}
        className="rounded-md"
        priority
      />
      {/* Text wordmark */}
      <div className="flex flex-col leading-tight">
        <span className="text-xl font-bold text-primary tracking-tight">
          SafeCampus
        </span>
        <span style={{ ...serifStyle, fontSize: "11px" }}>
          <span className="text-primary">Cal State </span>
          <span className="text-accent">Fullerton</span>
        </span>
      </div>
    </Link>
  );
}
