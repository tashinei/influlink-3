import React, { useState } from "react";
import { Dock } from "./ui/floating-dock";
import { MessageCircle, Megaphone, Link } from "lucide-react";
import ChatDrawer from "./ChatDrawer";

export default function NavigationDock() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const links = [
    {
      icon: MessageCircle,
      label: "Chat",
      onClick: () => setIsChatOpen(true),
      isActive: isChatOpen,
    },
    {
      icon: Megaphone,
      label: "Campaigns",
      onClick: () => console.log("Campaigns clicked"),
    },
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
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}