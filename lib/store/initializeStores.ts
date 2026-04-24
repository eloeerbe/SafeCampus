// SR-028, SR-029: Store rehydration and mock data seeding
// Seed stores with mockData on first launch when no persisted data exists in localStorage.
// If persisted data already exists, localStorage data is preserved (Zustand persist handles this).

import { useAuthStore } from "./authStore";
import { useReportsStore } from "./reportsStore";
import { useNotificationStore } from "./notificationStore";
import { mockUsers, mockReports, mockNotifications } from "../mockData";

/**
 * Wait for a Zustand persist store to finish rehydrating from localStorage.
 * Returns a promise that resolves once hydration is complete.
 */
function waitForHydration(store: {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}): Promise<void> {
  return new Promise<void>((resolve) => {
    if (store.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

/**
 * Initialize all Zustand stores with mock data if they are empty after rehydration.
 * - Req 15.5: If persisted data exists in localStorage, it is preserved.
 * - Req 16.4: Waits for rehydration before checking/seeding.
 */
export async function initializeStores(): Promise<void> {
  // Wait for all stores to finish rehydrating from localStorage
  await Promise.all([
    waitForHydration(useAuthStore),
    waitForHydration(useReportsStore),
    waitForHydration(useNotificationStore),
  ]);

  // Req 15.1: Seed authStore with mock users if empty
  const authState = useAuthStore.getState();
  if (authState.users.length === 0) {
    useAuthStore.setState({ users: mockUsers });
  }

  // Req 15.2: Seed reportsStore with mock reports if empty
  const reportsState = useReportsStore.getState();
  if (reportsState.reports.length === 0) {
    useReportsStore.setState({ reports: mockReports });
  }

  // Req 15.3: Seed notificationStore with mock notifications if empty
  const notifState = useNotificationStore.getState();
  if (notifState.notifications.length === 0) {
    useNotificationStore.setState({ notifications: mockNotifications });
  }
}
