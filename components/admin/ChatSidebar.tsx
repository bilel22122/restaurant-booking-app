"use client";

import { User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatUser {
    user_id: string;
    full_name: string;
    role: string;
}

interface ChatSidebarProps {
    users: ChatUser[];
    selectedUserId: string | null;
    unreadCounts: Record<string, number>;
    onSelectUser: (id: string) => void;
    currentUserId: string;
}

export default function ChatSidebar({
    users,
    selectedUserId,
    unreadCounts,
    onSelectUser,
    currentUserId,
}: ChatSidebarProps) {
    // Filter out the current user from the list if desired
    const colleagues = users.filter((u) => u.user_id !== currentUserId);

    return (
        <div className="w-full md:w-80 bg-white border-r border-gray-200 h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-4rem)] flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Colleagues</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {colleagues.length === 0 ? (
                    <div className="text-center p-4 text-gray-500 text-sm">
                        No colleagues found.
                    </div>
                ) : (
                    colleagues.map((user) => {
                        const unread = unreadCounts[user.user_id] || 0;
                        return (
                            <button
                                key={user.user_id}
                                onClick={() => onSelectUser(user.user_id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left relative",
                                    selectedUserId === user.user_id
                                        ? "bg-blue-50 border-blue-100" // Highlight
                                        : "hover:bg-gray-50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                    selectedUserId === user.user_id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                                )}>
                                    <User size={20} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className={cn(
                                            "font-medium truncate",
                                            selectedUserId === user.user_id ? "text-blue-900" : "text-gray-900"
                                        )}>
                                            {user.full_name || "Unknown User"}
                                        </p>
                                        {unread > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm z-10">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Shield size={10} />
                                        <span className="capitalize">{user.role}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
