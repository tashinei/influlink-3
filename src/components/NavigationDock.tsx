import React, { useState } from "react";
import { Dock } from "./ui/floating-dock";
import { MessageCircle, Briefcase, Megaphone, Link, User2 } from "lucide-react";
import ChatDrawer from "./ChatDrawer";
import CreateCampaignModal from "./CampaignModal";
import CampaignHistoryModal from "./CampaignHistoryModal";
import { useUserStore } from "@/store/useUserStore";
import LinksModal from "./LinksModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";

interface NavigationDockProps {
  onCampaignCreated?: () => void;
}

export default function NavigationDock({ onCampaignCreated }: NavigationDockProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);

  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const navigate = useNavigate();

  const handleChatWithCollaborator = (collaborator: any) => {
    setSelectedPartner(collaborator); // Set the person
    setIsLinksModalOpen(false);      // Close the list modal
    setIsChatOpen(true);             // Open the chat drawer
  };

  const handleOpenGeneralChat = () => {
    setSelectedPartner(null);
    setIsChatOpen(true);
  };
  const FRONTEND_URL = import.meta.env.FRONTEND_URL;
  const accountType = useUserStore((state) => state.accountType);

  const handleExplore = () => {
    const path = accountType === "creator" ? "/campaigns/search" : "/creators/search";
    navigate(path);
  };

  const { t } = useTranslation();



  let actionItem = null;

  if (accountType === "brand") {
    actionItem = {
      icon: User2,
      label: t("dock.findCreators"),
      onClick: handleExplore,
    };
  } else if (accountType === "creator") {
    actionItem = {
      icon: Briefcase,
      label: t("dock.findCampaigns"),
      onClick: handleExplore,
    };
  }

  const links = [
    {
      icon: MessageCircle,
      label: t("dock.chat"),
      onClick: handleOpenGeneralChat,
      isActive: isChatOpen,
    },

    ...(actionItem ? [actionItem] : []),

    {
      icon: Link,
      label: t("dock.links"),
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
        onChat={handleChatWithCollaborator}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setSelectedPartner(null); // Clear on close
        }}
        partner={selectedPartner}
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