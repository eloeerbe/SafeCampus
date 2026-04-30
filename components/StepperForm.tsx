"use client";

// Requirements: 5.1, 5.2, 5.3, 20.1, 20.2, 20.3
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LocationPicker } from "@/components/LocationPicker";
import { PhotoUploader } from "@/components/PhotoUploader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { reportFormSchema } from "@/lib/schemas";
import type { ReportCategory, Severity, Photo } from "@/lib/types";
import { cn } from "@/lib/cn";

type ReportFormData = z.infer<typeof reportFormSchema>;

interface StepperFormProps {
  onSubmit: (data: ReportFormData) => void;
}

const STEPS = [
  "Title & Description",
  "Category",
  "Severity",
  "Location",
  "Photos",
  "Privacy",
  "Review & Submit",
];

const CATEGORIES: ReportCategory[] = ["Safety", "Maintenance", "Accident", "Lost & Found", "Other"];
const SEVERITIES: Severity[] = ["Low", "Medium", "High", "Critical"];


export function StepperForm({ onSubmit }: StepperFormProps) {
  const [step, setStep] = useState(0);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Safety",
      severity: "Low",
      location: { lat: 0, lng: 0, areaName: "" },
      photos: [],
      isAnonymous: false,
    },
    mode: "onBlur",
  });

  const { register, control, handleSubmit, watch, trigger, formState: { errors } } = form;
  const values = watch();

  const validateStep = async (): Promise<boolean> => {
    const fieldsMap: Record<number, (keyof ReportFormData)[]> = {
      0: ["title", "description"],
      1: ["category"],
      2: ["severity"],
      3: ["location"],
      4: ["photos"],
      5: ["isAnonymous"],
    };
    const fields = fieldsMap[step];
    if (!fields) return true;
    return trigger(fields);
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid && step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                i <= step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
              )}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-4", i < step ? "bg-primary" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>
      <p className="text-sm font-medium text-gray-700">Step {step + 1}: {STEPS[step]}</p>

      {/* Step content */}
      <div className="min-h-[200px]">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input {...register("title")} placeholder="Brief title for the report" />
              {errors.title && <p className="mt-1 text-sm text-danger">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea {...register("description")} placeholder="Describe the issue in detail" rows={4} />
              {errors.description && <p className="mt-1 text-sm text-danger">{errors.description.message}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">Select Category</label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => field.onChange(cat)}
                      className={cn(
                        "rounded-lg border p-3 text-sm font-medium text-left transition-colors",
                        field.value === cat ? "border-primary bg-primary/5 text-primary" : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">Select Severity</label>
            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {SEVERITIES.map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => field.onChange(sev)}
                      className={cn(
                        "rounded-lg border p-3 text-sm font-medium text-left transition-colors flex items-center gap-2",
                        field.value === sev ? "border-primary bg-primary/5" : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      <SeverityBadge severity={sev} />
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">Select Location on Map</label>
            <Controller
              control={control}
              name="location"
              render={({ field }) => (
                <LocationPicker value={field.value.areaName ? field.value : undefined} onChange={field.onChange} />
              )}
            />
            {errors.location?.areaName && (
              <p className="text-sm text-danger">{errors.location.areaName.message}</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">Attach Photos (optional, max 3)</label>
            <Controller
              control={control}
              name="photos"
              render={({ field }) => (
                <PhotoUploader
                  photos={field.value}
                  onAdd={(photo) => field.onChange([...field.value, photo])}
                  onRemove={(id) => field.onChange(field.value.filter((p: Photo) => p.id !== id))}
                />
              )}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Privacy Settings</label>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Submit Anonymously</p>
                <p className="text-xs text-gray-500">Your name will not be shown on this report</p>
              </div>
              <Controller
                control={control}
                name="isAnonymous"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Review Your Report</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Title:</span> {values.title}</div>
              <div><span className="font-medium">Description:</span> {values.description}</div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Category:</span>
                <CategoryBadge category={values.category} />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Severity:</span>
                <SeverityBadge severity={values.severity} />
              </div>
              <div><span className="font-medium">Location:</span> {values.location.areaName || "Not selected"}</div>
              <div><span className="font-medium">Photos:</span> {values.photos.length} attached</div>
              <div><span className="font-medium">Anonymous:</span> {values.isAnonymous ? "Yes" : "No"}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleFormSubmit}>
            Submit Report
          </Button>
        )}
      </div>
    </div>
  );
}
