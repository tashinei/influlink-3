import React, { useEffect, useState, useRef } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/store/useUserStore";
import Cookies from "js-cookie";

interface Message {
    id: number;
    room_id: number;
    sender_id: string | number;
    text: string;
    is_read: boolean;
    created_at: string;
}

interface ChatContact {
    id: number;
    name: string;
    avatar?: string;
    handle: string;
    creator_id: string | number;
    brand_id: string | number;
}

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
    const { user, token: storeToken } = useUserStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [contacts, setContacts] = useState<ChatContact[]>([]);
    const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
    const [mounted, setMounted] = useState(false);
    const API_BASE = import.meta.env.VITE_API_URL;
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const activeToken = storeToken || Cookies.get('token');

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            fetchContacts();
            scrollToBottom();
        } else {
            const timer = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const currentToken = storeToken || Cookies.get('token');

        if (isOpen && user && currentToken) {
            socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
                withCredentials: true,
                auth: { token: currentToken }
            });

            const s = socketRef.current;

            s.on("connect", () => {
                console.log("✅ Socket Connected");
                
                if (activeContact) {
                    s.emit("join_room", activeContact.id);
                }
            });

            s.on("receive_message", (newMessage: Message) => {
                setMessages((prev) => {
                    if (prev.some(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });
                scrollToBottom();
            });

            return () => {
                console.log("🔌 Disconnecting Socket...");
                s.off("receive_message");
                s.disconnect();
                socketRef.current = null;
            };
        }
    }, [isOpen, user, storeToken]);

    useEffect(() => {
        if (activeContact && socketRef.current) {
            socketRef.current.emit("join_room", activeContact.id);
            fetchMessages(activeContact.id);
        }
    }, [activeContact]);

    const scrollToBottom = () => {
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const fetchContacts = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
                headers: { "Authorization": `Bearer ${activeToken}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setContacts(data);
                if (data.length > 0 && !activeContact) setActiveContact(data[0]);
            }
        } catch (err) { console.error(err); }
    };

    const fetchMessages = async (roomId: number) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${roomId}/messages`, {
                headers: { "Authorization": `Bearer ${activeToken}` }
            });
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
            scrollToBottom();
        } catch (err) { console.error(err); }
    };

    const handleSend = () => {
        if (!input.trim() || !activeContact || !user || !socketRef.current) return;

        const textToSend = input.trim();
        // Използваме String за ID-то, за да сме сигурни при сравнението по-късно
        const myId = String(user.id);

        scrollToBottom();
        setInput(""); // Изчистваме веднага

        // 2. Емитваме към сървъра
        socketRef.current.emit("send_message", {
            roomId: activeContact.id,
            text: textToSend,
            receiverId: String(activeContact.brand_id) === myId
                ? activeContact.creator_id
                : activeContact.brand_id
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (!isOpen && !mounted) return null;

    return (
        <>
            <div onClick={onClose} className={cn("fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity", isOpen ? "opacity-100" : "opacity-0")} />
            <div className={cn(
                "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-2xl h-[60vh] rounded-2xl overflow-hidden flex shadow-2xl border bg-white dark:bg-card transition-all duration-500",
                isOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
                {/* Sidebar */}
                <div className="w-16 flex flex-col items-center py-4 gap-4 bg-gradient-to-b from-primary via-secondary to-tertiary text-white shrink-0">
                    {contacts.map((contact) => (
                        <button key={contact.id} onClick={() => setActiveContact(contact)} className={cn("p-1 rounded-full transition-all", activeContact?.id === contact.id ? "ring-2 ring-white scale-110" : "opacity-70")}>
                            <Avatar className="w-10 h-10 border border-white/20">
                                <AvatarImage src={`${API_BASE}${contact.avatar}`} />
                                <AvatarFallback className="bg-white text-primary text-xs uppercase">{contact.name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                        </button>
                    ))}
                </div>

                {/* Chat */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {activeContact ? (
                        <>
                            <div className="p-4 border-b flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Avatar><AvatarImage src={`${API_BASE}${activeContact.avatar}`} /><AvatarFallback className="uppercase">{activeContact.name?.substring(0, 2)}</AvatarFallback></Avatar>
                                    <h3 className="font-bold text-sm">{activeContact.name}</h3>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                            </div>

                            <ScrollArea className="flex-1 p-4 bg-slate-50">
                                <div className="flex flex-col gap-3">
                                    {messages.map((msg) => {
                                        const isMe = String(msg.sender_id) === String(user?.id);

                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex flex-col max-w-[75%]",
                                                    isMe ? "self-end items-end" : "self-start items-start"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "py-2 rounded-2xl text-sm shadow-sm text-center",
                                                        isMe
                                                            ? "bg-gradient-to-br from-primary/90 via-secondary to-tertiary text-white px-4"
                                                            : "bg-gradient-to-br from-gray-200 via-white to-gray-200 px-4"
                                                    )}
                                                >
                                                    {msg.text}
                                                </div>

                                                <span className={`text-xs text-muted-foreground mt-1 px-1 ${isMe ? "self-end" : "self-start !ml-2"}}`}>
                                                    {formatTime(msg.created_at)}
                                                </span>
                                            </div>
                                        );
                                    })}

                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t flex gap-2 bg-gradient-to-r from-tertiary via-secondary to-primary">
                                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type..." className="rounded-xl" />
                                <Button type="submit" size="icon" className="rounded-xl bg-white"><Send className="w-4 h-4 text-primary" /></Button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground"><MessageSquare className="opacity-10 w-12 h-12" /></div>
                    )}
                </div>
            </div>
        </>
    );
}