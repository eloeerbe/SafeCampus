// Requirements: 6.3, 9.5, 19.2, SR-020, SR-027
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReportCategory, Severity, ReportStatus } from "../types";

export type DateRangeOption = "24h" | "7d" | "30d" | "all";

export interface MapFilters {
  categories: ReportCategory[];
  severities: Severity[];
  statuses: ReportStatus[];
  dateRange: DateRangeOption;
}

export interface UIState {
  mapFilters: MapFilters;
  feedFilter: ReportCategory | null;
  activeModal: string | null;
  demoBannerDismissed: boolean;
  setMapFilters: (filters: Partial<MapFilters>) => void;
  resetMapFilters: () => void;
  setFeedFilter: (category: ReportCategory | null) => void;
  setActiveModal: (modalId: string | null) => void;
  dismissDemoBanner: () => void;
}

const DEFAULT_FILTERS: MapFilters = {
  categories: [],
  severities: [],
  statuses: [],
  dateRange: "all",
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mapFilters: DEFAULT_FILTERS,
      feedFilter: null,
      activeModal: null,
      demoBannerDismissed: false,

      // SR-020, SR-027: Set multi-select filters for the heat map
      setMapFilters: (filters) => {
        set((state) => ({
          mapFilters: { ...state.mapFilters, ...filters },
        }));
      },

      resetMapFilters: () => {
        set({ mapFilters: DEFAULT_FILTERS });
      },

      // Req 6.3: Set category filter for the report feed
      setFeedFilter: (category) => {
        set({ feedFilter: category });
      },

      setActiveModal: (modalId) => {
        set({ activeModal: modalId });
      },

      // Req 19.2: Dismiss demo banner for the remainder of the session
      dismissDemoBanner: () => {
        set({ demoBannerDismissed: true });
      },
    }),
    {
      name: "ui-storage-v2",
      partialize: (state) => ({
        mapFilters: state.mapFilters,
        feedFilter: state.feedFilter,
      }),
    }
  )
);
