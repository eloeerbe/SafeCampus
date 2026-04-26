"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { translations } from "@/lib/translations";

export function useTranslation() {
  // Grab the language from your Auth Store (defaulting to 'en')
  const language = useAuthStore((s) => s.currentUser?.language) || "en";
  
  // Return the 't' object (the dictionary) and the language string
  return {
    t: translations[language as keyof typeof translations],
    language,
  };
}