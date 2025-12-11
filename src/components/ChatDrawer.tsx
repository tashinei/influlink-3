import React, { useEffect, useState } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

interface Message {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
}

interface ChatContact {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
    isOnline?: boolean;
}

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const mockContacts: ChatContact[] = [
    { id: "1", name: "AI Assistant", initials: "AI", isOnline: true },
    { id: "2", name: "Sarah Chen", initials: "SC", isOnline: true },
    { id: "3", name: "Mike Johnson", initials: "MJ", isOnline: false },
    { id: "4", name: "Emma Wilson", initials: "EW", isOnline: true },
    { id: "5", name: "Alex Rivera", initials: "AR", isOnline: false },
];

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hey! How can I help you today?",
            sender: "ai",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [activeContact, setActiveContact] = useState<ChatContact>(mockContacts[0]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Trigger entry animation on next tick
            const timer = setTimeout(() => setMounted(true), 10);
            return () => clearTimeout(timer);
        } else {
            setMounted(false); // prepare for exit
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "Thanks for your message! I'm here to assist you.",
                sender: "ai",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen && !mounted) return null;

    return (
        <>
            <div
                onClick={onClose}
                className={cn(
                    "fixed inset-0 bg-background/40 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
            />

            {/* Chat Panel */}
            <div
                className={cn(
                    "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-2xl h-[70vh] max-h-[600px] rounded-2xl overflow-hidden flex shadow-2xl border border-border/50 transition-all duration-500 ease-out",
                    mounted
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-8 opacity-0 scale-95"
                )}
            >
                {/* Glass background */}
                <div className="absolute inset-0 bg-[white] backdrop-blur-lg" />
                <div className="absolute inset-0 bg-card/80 backdrop-blur-md" />

                {/* Contacts Sidebar */}
                <TooltipProvider delayDuration={0}>
                    <div className="relative z-10 w-16 flex flex-col items-center py-4 gap-3 bg-gradient-to-br from-primary via-secondary to-[#90d5f3ff]">
                        {mockContacts.map((contact) => (
                            <Tooltip key={contact.id}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setActiveContact(contact)}
                                        className={cn(
                                            "relative p-0.5 rounded-full transition-all duration-200",
                                            activeContact.id === contact.id
                                                ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                                                : "hover:ring-2 hover:ring-muted-foreground/30"
                                        )}
                                    >
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={contact.avatar} />
                                            <AvatarFallback className="bg-[white] text-[primary] text-xs font-medium">
                                                {contact.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        {contact.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                    {contact.name}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>

                {/* Main Chat Area */}
                <div className="relative z-10 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-[#22222]">
                                        {activeContact.initials}
                                    </AvatarFallback>
                                </Avatar>
                                {activeContact.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{activeContact.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {activeContact.isOnline ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    className={cn(
                                        "relative max-w-[80%] px-4 py-2.5 rounded-2xl overflow-hidden",
                                        "backdrop-blur-xl border shadow-lg",
                                        message.sender === "user"
                                            ? "bg-gradient-to-br from-secondary/80 via-primary/100 to-secondary/80 border-white/30 text-primary-foreground rounded-br-md shadow-black/20"
                                            : "bg-gradient-to-br from-gray-400/35 via-white/30 to-gray-400/35 border-gray-00/40 text-foreground rounded-bl-md shadow-black/20"
                                    )}

                                    style={message.sender === "user" ? {justifySelf:"flex-end"} : {justifySelf:"flex-start"}}
                                >
                                    {/* Inner highlight for glass depth */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                    <p className="relative text-sm">{message.content}</p>
                                    <p
                                        className={cn(
                                            "relative text-[10px] mt-1",
                                            message.sender === "user"
                                                ? "text-primary-foreground/80"
                                                : "text-foreground/60"
                                        )}
                                    >
                                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 bg-gradient-to-r from-[#90d5f3ff] via-secondary to-primary">
                        <div className="flex items-center gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="flex-1 bg-[white] border-border/50 focus-visible:ring-primary backdrop-blur-sm text-[black]"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                size="icon"
                                className="rounded-full text-[black] bg-[white] hover:bg-primary/90 disabled:opacity-100"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
