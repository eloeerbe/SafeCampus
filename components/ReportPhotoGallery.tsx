"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Photo } from "@/lib/types";

interface ReportPhotoGalleryProps {
  photos: Photo[];
}

export function ReportPhotoGallery({ photos }: ReportPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className="overflow-hidden rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Open report photo"
          >
            <Image
              src={photo.url}
              alt="Report photo"
              width={320}
              height={180}
              className="h-32 w-full object-cover transition-transform hover:scale-[1.02]"
              unoptimized
            />
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>
          <Image
            src={selectedPhoto.url}
            alt="Expanded report photo"
            width={1200}
            height={900}
            className="max-h-[86vh] w-auto max-w-[92vw] rounded-lg object-contain shadow-2xl"
            unoptimized
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
