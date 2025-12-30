import React, { useState } from "react";
import { Dock } from "./ui/floating-dock";
import { MessageCircle, Briefcase, Megaphone, Link } from "lucide-react";
import ChatDrawer from "./ChatDrawer";
import CreateCampaignModal from "./CampaignModal";
import CampaignHistoryModal from "./CampaignHistoryModal";
import { useUserStore } from "@/store/useUserStore";

interface NavigationDockProps {
  onCampaignCreated?: () => void;
}

export default function NavigationDock({ onCampaignCreated }: NavigationDockProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  // State for BRAND action: Create new campaign
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  // State for CREATOR action: View campaign history
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const accountType = useUserStore((state) => state.accountType);

  // --- Dynamic Action Button Logic ---
  let actionItem = null;

  if (accountType === "brand") {
    actionItem = {
      icon: Megaphone,
      label: "New Campaign",
      onClick: () => setIsNewCampaignModalOpen(true),
    };
  } else if (accountType === "creator") {
    actionItem = {
      icon: Briefcase,
      label: "Campaigns",
      onClick: () => setIsHistoryModalOpen(true), // 👈 OPENS HISTORY MODAL
    };
  }

  const links = [
    {
      icon: MessageCircle,
      label: "Chat",
      onClick: () => setIsChatOpen(true),
      isActive: isChatOpen,
    },

    ...(actionItem ? [actionItem] : []),

    {
      icon: Link,
      label: "Links",
      onClick: () => console.log("Links clicked"),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center w-full">
        <Dock items={links} />
      </div>

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <CreateCampaignModal
        open={isNewCampaignModalOpen}
        onOpenChange={setIsNewCampaignModalOpen}
        onSuccess={() => {
          if (onCampaignCreated) onCampaignCreated();
        }}
      />

      <CampaignHistoryModal 
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
      />
    </>
  );
}