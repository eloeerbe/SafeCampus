import { z } from "zod";
import { CSUF_BOUNDS } from "./constants";

// SR-001: Only CSUF emails allowed
export const csuEmailSchema = z
  .string()
  .email()
  .refine((email) => email.endsWith("@csu.fullerton.edu"), {
    message: "Only CSUF emails are allowed",
  });

// SR-003: Password strength validation (8+ chars, symbol required)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters and include a symbol")
  .refine((pw) => /[^a-zA-Z0-9]/.test(pw), {
    message: "Password must be at least 8 characters and include a symbol",
  });

// SR-004: OTP must be exactly 7 numeric digits
export const otpSchema = z
  .string()
  .regex(/^\d{7}$/, "Invalid verification code.");

// SR-022: Category and severity enum validation
export const reportCategorySchema = z.enum([
  "Safety",
  "Maintenance",
  "Accident",
  "Lost & Found",
  "Other",
]);

export const severitySchema = z.enum(["Low", "Medium", "High", "Critical"]);

function isWithinCsufBounds(location: { lat: number; lng: number }) {
  const [[south, west], [north, east]] = CSUF_BOUNDS;

  return (
    location.lat >= south
    && location.lat <= north
    && location.lng >= west
    && location.lng <= east
  );
}

// Requirement 5.3, 20.1: Report form validation with all required fields
export const reportFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: reportCategorySchema,
  severity: severitySchema,
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    areaName: z.string().min(1, "Location is required"),
  }).refine(isWithinCsufBounds, {
    message: "Please choose a location within campus grounds.",
    path: ["areaName"],
  }),
  photos: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        fileType: z.enum(["image/jpeg", "image/png"]),
        uploadedAt: z.string(),
      })
    )
    .max(3, "Maximum 3 photos per report"),
  isAnonymous: z.boolean(),
});

// Requirement 1.2, 1.4, 1.5: Signup form validation
export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: csuEmailSchema,
  password: passwordSchema,
});

// Requirement 2.4, 20.1: Login form validation
export const loginSchema = z.object({
  email: z.string().email("Valid email is required").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

// Requirement 4.4, 4.5: Reset password form validation
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
