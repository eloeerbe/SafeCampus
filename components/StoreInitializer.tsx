"use client";

// Req 16.4: Ensure all Zustand stores rehydrate from localStorage before rendering children
// Prevents flash of unauthenticated content by showing a loading state until hydration completes
import { useEffect, useState } from "react";
import { initializeStores } from "@/lib/store/initializeStores";

interface StoreInitializerProps {
  children: React.ReactNode;
}

export function StoreInitializer({ children }: StoreInitializerProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    initializeStores().then(() => {
      setHydrated(true);
    });
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading SafeCampus…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
