// Requirements: 6.3, 9.5, 19.2
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReportCategory, Severity } from "../types";

export interface UIState {
  mapFilters: { category?: ReportCategory; severity?: Severity };
  feedFilter: ReportCategory | null;
  activeModal: string | null;
  demoBannerDismissed: boolean;
  setMapFilters: (filters: Partial<UIState["mapFilters"]>) => void;
  setFeedFilter: (category: ReportCategory | null) => void;
  setActiveModal: (modalId: string | null) => void;
  dismissDemoBanner: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mapFilters: {},
      feedFilter: null,
      activeModal: null,
      demoBannerDismissed: false,

      // Req 9.5: Set category/severity filters for the heat map
      setMapFilters: (filters) => {
        set((state) => ({
          mapFilters: { ...state.mapFilters, ...filters },
        }));
      },

      // Req 6.3: Set category filter for the report feed
      setFeedFilter: (category) => {
        set({ feedFilter: category });
      },

      // Set the currently active modal by id
      setActiveModal: (modalId) => {
        set({ activeModal: modalId });
      },

      // Req 19.2: Dismiss demo banner for the remainder of the session
      dismissDemoBanner: () => {
        set({ demoBannerDismissed: true });
      },
    }),
    {
      name: "ui-storage",
      // Only persist mapFilters and feedFilter.
      // demoBannerDismissed resets on page reload (Req 19.2) and
      // activeModal is transient UI state — neither should be persisted.
      partialize: (state) => ({
        mapFilters: state.mapFilters,
        feedFilter: state.feedFilter,
      }),
    }
  )
);
