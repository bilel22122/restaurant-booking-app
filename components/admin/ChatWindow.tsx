"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string; // or number, prompt implies uuid usually but 'id' is fine
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
}

interface ChatUser {
    user_id: string;
    full_name: string;
    role: string;
}

interface ChatWindowProps {
    messages: Message[];
    currentUserId: string;
    selectedUser: ChatUser | null;
    onSendMessage: (content: string) => void;
}

export default function ChatWindow({
    messages,
    currentUserId,
    selectedUser,
    onSendMessage,
}: ChatWindowProps) {
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 h-[calc(100vh-4rem)]">
                <div className="text-center text-gray-400">
                    <p className="text-lg">Select a colleague to start chatting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-4rem)] bg-gray-50">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserIcon size={20} />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-800">{selectedUser.full_name}</h2>
                    <p className="text-xs text-gray-500 capitalize">{selectedUser.role}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full",
                                isMe ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                                    isMe
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                                )}
                            >
                                <p>{msg.content}</p>
                                <span className={cn(
                                    "text-[10px] block mt-1 opacity-70",
                                    isMe ? "text-blue-100 text-right" : "text-gray-400"
                                )}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} className="ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
