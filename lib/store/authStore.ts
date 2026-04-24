// Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.5, 2.6, 3.2, 4.4, 13.2, 13.3, 16.1
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, NotificationPrefs } from "../types";

export interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean; error?: string; redirect?: string };
  logout: () => void;
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  verifyOTP: (code: string) => boolean;
  resetPassword: (email: string, otp: string, newPassword: string) => { success: boolean; error?: string };
  toggleMFA: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateNotifPrefs: (prefs: Partial<NotificationPrefs>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],

      // Req 2.1, 2.2, 2.3, 2.5, 2.6: Login with credential validation, role-based redirect, lockout
      login: (email: string, password: string) => {
        const state = get();
        const userIndex = state.users.findIndex((u) => u.email === email);

        if (userIndex === -1) {
          return { success: false, error: "Invalid email or password" };
        }

        const user = state.users[userIndex];

        // SR-002: Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
          return { success: false, error: "Account locked. Try again in 15 minutes." };
        }

        // SR-003: Check password match
        if (user.passwordHash !== password) {
          const newAttempts = user.failedLoginAttempts + 1;
          const updatedUser = { ...user, failedLoginAttempts: newAttempts } as User;

          // SR-002: Lock after 3 failed attempts
          if (newAttempts >= 3) {
            updatedUser.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          }

          const updatedUsers = [...state.users];
          updatedUsers[userIndex] = updatedUser;
          set({ users: updatedUsers });

          return { success: false, error: "Invalid email or password" };
        }

        // Successful login — reset failed attempts
        const loggedInUser = { ...user, failedLoginAttempts: 0, lockedUntil: null } as User;
        const updatedUsers = [...state.users];
        updatedUsers[userIndex] = loggedInUser;

        // Req 3.4: If MFA enabled, redirect to /verify
        if (loggedInUser.mfaEnabled) {
          set({ currentUser: loggedInUser, users: updatedUsers });
          return { success: true, redirect: "/verify" };
        }

        set({ currentUser: loggedInUser, users: updatedUsers });

        // Req 2.1, 2.2: Role-based redirect
        const redirect = loggedInUser.role === "admin" ? "/admin" : "/dashboard";
        return { success: true, redirect };
      },

      // Req 1.1, 1.2, 1.3, 1.4: Signup with CSUF email validation, duplicate check
      signup: (name: string, email: string, password: string) => {
        const state = get();

        // SR-001: Validate CSUF email domain
        if (!email.endsWith("@csu.fullerton.edu")) {
          return { success: false, error: "Only CSUF emails are allowed" };
        }

        // SR-026: Duplicate email check — prevent duplicate signup
        if (state.users.some((u) => u.email === email)) {
          return { success: false, error: "An account with this email already exists" };
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          name,
          email,
          passwordHash: password, // demo: store password as-is
          role: "student",
          avatar: "",
          isVerified: false,
          mfaEnabled: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
          notificationPrefs: {
            emailEnabled: true,
            inAppEnabled: true,
            categories: {
              safety: true,
              maintenance: true,
              harassment: true,
              lostAndFound: true,
              other: true,
            },
          },
          language: "en",
          publicProfile: false,
          locationPermission: false,
          createdAt: new Date().toISOString(),
        };

        set({ users: [...state.users, newUser], currentUser: newUser });
        return { success: true };
      },

      // SR-004: Verify OTP — accept any 7-digit numeric string
      verifyOTP: (code: string) => {
        if (!/^\d{7}$/.test(code)) {
          return false;
        }

        const state = get();
        if (!state.currentUser) return false;

        const verifiedUser = { ...state.currentUser, isVerified: true };
        const updatedUsers = state.users.map((u) =>
          u.id === verifiedUser.id ? verifiedUser : u
        );

        set({ currentUser: verifiedUser, users: updatedUsers });
        return true;
      },

      // Req 4.4: Reset password with OTP validation and password update
      resetPassword: (email: string, otp: string, newPassword: string) => {
        if (!/^\d{7}$/.test(otp)) {
          return { success: false, error: "Invalid verification code." };
        }

        const state = get();
        const userIndex = state.users.findIndex((u) => u.email === email);

        if (userIndex === -1) {
          return { success: false, error: "User not found" };
        }

        const updatedUser = { ...state.users[userIndex], passwordHash: newPassword };
        const updatedUsers = [...state.users];
        updatedUsers[userIndex] = updatedUser;

        // If the current user is the one resetting, update currentUser too
        const currentUser = state.currentUser?.id === updatedUser.id ? updatedUser : state.currentUser;

        set({ users: updatedUsers, currentUser });
        return { success: true };
      },

      // Logout: clear currentUser
      logout: () => {
        set({ currentUser: null });
      },

      // SR-021: Toggle MFA — invert mfaEnabled (involution property)
      toggleMFA: () => {
        const state = get();
        if (!state.currentUser) return;

        const updatedUser = { ...state.currentUser, mfaEnabled: !state.currentUser.mfaEnabled };
        const updatedUsers = state.users.map((u) =>
          u.id === updatedUser.id ? updatedUser : u
        );

        set({ currentUser: updatedUser, users: updatedUsers });
      },

      // Req 13.1: Update profile — merge partial updates into currentUser
      updateProfile: (updates: Partial<User>) => {
        const state = get();
        if (!state.currentUser) return;

        const updatedUser = { ...state.currentUser, ...updates };
        const updatedUsers = state.users.map((u) =>
          u.id === updatedUser.id ? updatedUser : u
        );

        set({ currentUser: updatedUser, users: updatedUsers });
      },

      // SR-020: Update notification preferences — merge partial NotificationPrefs
      updateNotifPrefs: (prefs: Partial<NotificationPrefs>) => {
        const state = get();
        if (!state.currentUser) return;

        const mergedPrefs: NotificationPrefs = {
          ...state.currentUser.notificationPrefs,
          ...prefs,
          categories: {
            ...state.currentUser.notificationPrefs.categories,
            ...(prefs.categories || {}),
          },
        };

        const updatedUser = { ...state.currentUser, notificationPrefs: mergedPrefs };
        const updatedUsers = state.users.map((u) =>
          u.id === updatedUser.id ? updatedUser : u
        );

        set({ currentUser: updatedUser, users: updatedUsers });
      },
    }),
    {
      name: "auth-storage", // Req 16.1: localStorage key
    }
  )
);
