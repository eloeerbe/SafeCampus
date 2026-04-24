// Requirements: 5.2, 6.1, 6.2, 6.3, 8.1, 8.2, 8.5, 11.2, 16.2
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Report, ReportCategory } from "../types";

export interface ReportsState {
  reports: Report[];
  addReport: (
    data: Omit<Report, "id" | "status" | "submittedAt" | "upvotedBy" | "resolvedAt" | "resolvedBy" | "resolutionNotes">
  ) => Report;
  upvoteReport: (reportId: string, userId: string) => { success: boolean; error?: string };
  removeUpvote: (reportId: string, userId: string) => void;
  markResolved: (reportId: string, adminId: string, notes: string) => void;
  getByCategory: (category: ReportCategory) => Report[];
  getSortedByUpvotes: () => Report[];
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: [],

      // SR-009: Create report with defaults — status "Open", empty upvotedBy, current timestamp, null resolved fields
      addReport: (data) => {
        const newReport: Report = {
          ...data,
          id: crypto.randomUUID(),
          status: "Open",
          upvotedBy: [],
          submittedAt: new Date().toISOString(),
          resolvedAt: null,
          resolvedBy: null,
          resolutionNotes: null,
        };

        set({ reports: [...get().reports, newReport] });
        return newReport;
      },

      // SR-024, SR-025: Upvote with idempotence and self-upvote prevention
      upvoteReport: (reportId: string, userId: string) => {
        const state = get();
        const reportIndex = state.reports.findIndex((r) => r.id === reportId);

        if (reportIndex === -1) {
          return { success: false, error: "This report is no longer available" };
        }

        const report = state.reports[reportIndex];

        // SR-024: Prevent self-upvote
        if (report.authorId === userId) {
          return { success: false, error: "You cannot upvote your own report" };
        }

        // Idempotence: no duplicate entries
        if (report.upvotedBy.includes(userId)) {
          return { success: false, error: "You have already upvoted this report" };
        }

        const updatedReport = {
          ...report,
          upvotedBy: [...report.upvotedBy, userId],
        };
        const updatedReports = [...state.reports];
        updatedReports[reportIndex] = updatedReport;

        set({ reports: updatedReports });
        return { success: true };
      },

      // Remove upvote
      removeUpvote: (reportId: string, userId: string) => {
        const state = get();
        const reportIndex = state.reports.findIndex((r) => r.id === reportId);

        if (reportIndex === -1) return;

        const report = state.reports[reportIndex];
        const updatedReport = {
          ...report,
          upvotedBy: report.upvotedBy.filter((id) => id !== userId),
        };
        const updatedReports = [...state.reports];
        updatedReports[reportIndex] = updatedReport;

        set({ reports: updatedReports });
      },

      // SR-014: Mark report as resolved — set status, resolvedAt, resolvedBy, resolutionNotes
      markResolved: (reportId: string, adminId: string, notes: string) => {
        const state = get();
        const reportIndex = state.reports.findIndex((r) => r.id === reportId);

        if (reportIndex === -1) return;

        const updatedReport = {
          ...state.reports[reportIndex],
          status: "Resolved" as const,
          resolvedAt: new Date().toISOString(),
          resolvedBy: adminId,
          resolutionNotes: notes,
        };
        const updatedReports = [...state.reports];
        updatedReports[reportIndex] = updatedReport;

        set({ reports: updatedReports });
      },

      // SR-011: Filter reports by category
      getByCategory: (category: ReportCategory) => {
        return get().reports.filter((r) => r.category === category);
      },

      // SR-010: Non-resolved reports sorted by upvotes DESC, submittedAt DESC tiebreaker
      getSortedByUpvotes: () => {
        return get()
          .reports.filter((r) => r.status !== "Resolved")
          .sort((a, b) => {
            const upvoteDiff = b.upvotedBy.length - a.upvotedBy.length;
            if (upvoteDiff !== 0) return upvoteDiff;
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
          });
      },
    }),
    {
      name: "reports-storage", // Req 16.2: localStorage key
    }
  )
);
