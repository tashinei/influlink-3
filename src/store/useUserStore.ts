import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  isRegistered: boolean;
  accountType: "creator" | "brand" | null;
  language: "bg" | "en" | "de";
  setRegistered: (value: boolean) => void;
  setAccountType: (type: "creator" | "brand" | null) => void;
  setLanguage: (lang: "bg" | "en" ) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isRegistered: false,
      accountType: null,
      language: "bg",
      setRegistered: (value) => set({ isRegistered: value }),
      setAccountType: (type) => set({ accountType: type }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: "user" }
  )
);

