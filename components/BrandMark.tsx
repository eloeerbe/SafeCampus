"use client";

import Link from "next/link";

// Serif style matches the landing page co-brand line exactly
const serifStyle: React.CSSProperties = {
  fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  letterSpacing: "0.02em",
};

type Props = { href?: string; className?: string };

export function BrandMark({ href = "/", className = "" }: Props) {
  return (
    <Link href={href} className={`flex flex-col leading-tight ${className}`}>
      <span className="text-xl font-bold text-primary tracking-tight">
        SafeCampus
      </span>
      <span style={{ ...serifStyle, fontSize: "11px" }}>
        <span className="text-primary">Cal State </span>
        <span className="text-accent">Fullerton</span>
      </span>
    </Link>
  );
}
