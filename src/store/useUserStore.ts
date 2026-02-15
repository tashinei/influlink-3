import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  isVIP: boolean;
  accountType: string;
}

interface UserState {
  isRegistered: boolean;
  accountType: "creator" | "brand" | null;
  language: "bg" | "en";

  token: string | null;
  user: User | null;

  isVIP: boolean;

  setRegistered: (value: boolean) => void;
  setAccountType: (type: "creator" | "brand" | null) => void;
  setLanguage: (lang: "bg" | "en") => void;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;

  setVIP: (value: boolean) => void;

  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isRegistered: false,
      accountType: null,
      language: "en",

      token: null,
      user: null,

      isVIP: false,

      setRegistered: (value) => set({ isRegistered: value }),
      setAccountType: (type) => set({ accountType: type }),
      setLanguage: (lang) => set({ language: lang }),

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      setVIP: (value) => set({ isVIP: value }), // ⭐

      logout: () => {
        set({
          token: null,
          user: null,
          isRegistered: false,
          accountType: null,
          isVIP: false,
        });

        useUserStore.persist.clearStorage();
        localStorage.removeItem("user-storage");
      },
    }),
    { name: "user-storage" }
  )
);
