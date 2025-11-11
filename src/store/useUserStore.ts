import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  isRegistered: boolean;
  accountType: "creator" | "brand" | null;
  setRegistered: (value: boolean) => void;
  setAccountType: (type: "creator" | "brand" | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isRegistered: false,
      accountType: null,
      setRegistered: (value) => set({ isRegistered: value }),
      setAccountType: (type) => set({ accountType: type }),
    }),
    { name: "user" } // in localStorage
  )
);
