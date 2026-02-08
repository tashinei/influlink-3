import React, { useState } from "react";
import { Dock } from "./ui/floating-dock";
import { MessageCircle, Briefcase, Megaphone, Link } from "lucide-react";
import ChatDrawer from "./ChatDrawer";
import CreateCampaignModal from "./CampaignModal";
import CampaignHistoryModal from "./CampaignHistoryModal";
import { useUserStore } from "@/store/useUserStore";
import LinksModal from "./LinksModal";
import { useTranslation } from "@/hooks/useTranslation";

interface NavigationDockProps {
  onCampaignCreated?: () => void;
}

export default function NavigationDock({ onCampaignCreated }: NavigationDockProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);

  const {t} = useTranslation();

  const accountType = useUserStore((state) => state.accountType);

  let actionItem = null;

  if (accountType === "brand") {
    actionItem = {
      icon: Megaphone,
      label: t("dock.newCampaign"),
      onClick: () => setIsNewCampaignModalOpen(true),
    };
  } else if (accountType === "creator") {
    actionItem = {
      icon: Briefcase,
      label:  t("dock.campaigns"),
      onClick: () => setIsHistoryModalOpen(true),
    };
  }

  const links = [
    {
      icon: MessageCircle,
      label:  t("dock.chat"),
      onClick: () => setIsChatOpen(true),
      isActive: isChatOpen,
    },

    ...(actionItem ? [actionItem] : []),

    {
      icon: Link,
      label:  t("dock.links"),
      onClick: () => setIsLinksModalOpen(true),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center w-full">
        <Dock items={links} />
      </div>

      <LinksModal 
        open={isLinksModalOpen} 
        onOpenChange={setIsLinksModalOpen}
        accountType={accountType}
      />

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