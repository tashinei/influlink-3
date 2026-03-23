import { create } from "zustand";

interface ChatStore {
  isChatOpen: boolean;
  chatPartner: any | null;
  openChat: (partner?: any) => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isChatOpen: false,
  chatPartner: null,
  openChat: (partner = null) => set({ isChatOpen: true, chatPartner: partner }),
  closeChat: () => set({ isChatOpen: false, chatPartner: null }),
}));