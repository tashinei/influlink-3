import React, { useState, useEffect } from "react";
import { Dock } from "./ui/floating-dock";
import { MessageCircle, Briefcase, Link, User2, Bell, CheckCheck, Loader2 } from "lucide-react";
import ChatDrawer from "./ChatDrawer";
import CreateCampaignModal from "./CampaignModal";
import CampaignHistoryModal from "./CampaignHistoryModal";
import { useUserStore } from "@/store/useUserStore";
import LinksModal from "./LinksModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import NotificationDropdown, { type Notification } from "./notifications/NotificationDropdown";
import { NotificationDetailModal } from "./notifications/NotificationDetailModal";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media.query";
import { PaymentModal } from "./payments/PaymentModal";

interface NavigationDockProps {
  onCampaignCreated?: () => void;
  initialChatOpen?: boolean;
  initialChatPartner?: any;
  onChatStateChange?: (open: boolean) => void;
}

export default function NavigationDock
  ({
    onCampaignCreated,
    initialChatOpen = false,
    initialChatPartner = null,
    onChatStateChange
  }: NavigationDockProps) {
  const [isChatOpen, setIsChatOpen] = useState(initialChatOpen);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");


  // Add inside the component alongside other state:
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<any>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const { user, accountType } = useUserStore();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handlePayBegin = (collaborator: any) => {
    setPaymentTarget(collaborator);
    setIsLinksModalOpen(false);
    setIsPaymentOpen(true);
  };

  const fetchCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const [selectedPartner, setSelectedPartner] = useState<any>(initialChatPartner);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleExplore = () => {
    const path = accountType === "creator" ? "/campaigns/search" : "/creators/search";
    navigate(path);
  };

  useEffect(() => {
    if (initialChatOpen) {
      setIsChatOpen(true);
      setSelectedPartner(initialChatPartner);
    }
  }, [initialChatOpen, initialChatPartner]);

  const handleChatWithCollaborator = (collaborator: any) => {
    setSelectedPartner(collaborator);
    setIsLinksModalOpen(false);
    setIsChatOpen(true);
  };

  const links = [
    {
      label: t("dock.chat"),
      icon: <MessageCircle className="h-full w-full" />,
      onClick: () => setIsChatOpen(true),
      isActive: isChatOpen,
    },
    {
      label: accountType === "brand" ? t("dock.findCreators") : t("dock.findCampaigns"),
      icon: accountType === "brand" ? <User2 className="h-full w-full" /> : <Briefcase className="h-full w-full" />,
      onClick: handleExplore,
    },
    {
      label: t("dock.links"),
      icon: <Link className="h-full w-full" />,
      onClick: () => setIsLinksModalOpen(true),
      isActive: isLinksModalOpen,
    },
    {
      id: "notifications",
      label: t("dock.notifications") || "Notifications",
      icon: (
        <div className="relative h-full w-full flex items-center justify-center">
          <Bell className="h-full w-full" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-secondary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      ),
      onClick: () => setIsNotificationsOpen(true),
      isActive: isNotificationsOpen,
    },
  ];

  const visibleLinks = isDesktop
    ? links.filter(link => link.id !== "notifications")
    : links;

  return (
    <>
      <div className="fixed bottom-4 flex items-center justify-center w-full z-50">
        <Dock items={visibleLinks} />
      </div>

      <LinksModal open={isLinksModalOpen} onOpenChange={setIsLinksModalOpen} accountType={accountType} onChat={handleChatWithCollaborator} onPayBegin={handlePayBegin} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => { setIsChatOpen(false); setSelectedPartner(null); }} partner={selectedPartner} />

      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-[20px] border-t overflow-hidden flex flex-col [&>button]:hidden max-h-[75dvh]"
        >
          <SheetHeader className="flex flex-row items-center justify-between space-y-0">
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <NotificationDropdown
              setDropdownOpen={setIsNotificationsOpen}
              className="relative border-none shadow-none w-full"
              onNotificationSelect={setSelectedNotification}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal lives outside Sheet so it survives when sheet closes */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onDropdownClose={() => setIsNotificationsOpen(false)}
        onOpenChat={(partner) => {
          setSelectedPartner(partner);
          setIsChatOpen(true);
        }}
      />

      <CreateCampaignModal open={isNewCampaignModalOpen} onOpenChange={setIsNewCampaignModalOpen} onSuccess={() => onCampaignCreated?.()} />
      <CampaignHistoryModal open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen} />
      {paymentTarget && (
        <PaymentModal
          open={isPaymentOpen}
          onOpenChange={(open) => {
            setIsPaymentOpen(open);
            if (!open) setPaymentTarget(null);
          }}
          dealAmount={Number(paymentTarget.proposedPrice ?? paymentTarget.campaignBudget) || 0}
          creatorId={paymentTarget.id}
          campaignId={paymentTarget.campaignId || ""}
          creatorName={paymentTarget.name}
          campaignName={paymentTarget.currentCampaign}
          onSuccess={() => {
            setIsPaymentOpen(false);
            setPaymentTarget(null);
          }}
        />
      )}
    </>
  );
}