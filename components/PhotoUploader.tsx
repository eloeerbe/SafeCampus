"use client";

// Requirements: 5.4, 5.6, 5.7
import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  photos: Photo[];
  onAdd: (photo: Photo) => void;
  onRemove: (photoId: string) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 3,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // SR-005: Only accept jpeg and png
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toast.error("Only JPG and PNG files are accepted"); // SR-005
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // SR-006: Enforce max photos
    if (photos.length >= maxPhotos) {
      toast.error("Maximum 3 photos per report"); // SR-006
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const photo: Photo = {
        id: crypto.randomUUID(),
        url: reader.result as string,
        fileType: file.type as "image/jpeg" | "image/png",
        uploadedAt: new Date().toISOString(),
      };
      onAdd(photo);
    };
    reader.onerror = () => {
      toast.error("Failed to process image. Please try again.");
    };
    reader.readAsDataURL(file);

    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative h-20 w-20 rounded-md overflow-hidden border">
            <img src={photo.url} alt="Upload" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={photos.length >= maxPhotos}
      >
        <Camera className="mr-2 h-4 w-4" />
        Add Photo ({photos.length}/{maxPhotos})
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
