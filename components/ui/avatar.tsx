"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";

// Avatar with image and fallback

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles: Record<string, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function Avatar({ src, alt = "", fallback, size = "md", className, ...props }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const showFallback = !src || imgError;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showFallback ? (
        <span className="font-medium text-gray-600">
          {fallback || alt?.charAt(0)?.toUpperCase() || "?"}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}

export { Avatar };
