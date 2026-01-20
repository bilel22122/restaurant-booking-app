"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import ChatSidebar from "@/components/admin/ChatSidebar";
import ChatWindow from "@/components/admin/ChatWindow";
import { Loader2 } from "lucide-react";

interface ChatUser {
    user_id: string;
    full_name: string;
    role: string;
}

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read?: boolean;
}

export default function ChatPage() {
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    // Use a ref to access the latest selectedUserId in the subscription callback
    // without re-subscribing constantly.
    const selectedUserRef = useRef<string | null>(null);

    useEffect(() => {
        selectedUserRef.current = selectedUserId;
    }, [selectedUserId]);

    const fetchUnreadCounts = useCallback(async (myUserId: string) => {
        // Ideally we would use a GROUP BY query, but basic Supabase client 
        // doesn't do "select count, group by" easily in one go without RPC.
        // So we fetch all unread messages for 'me' and aggregate in JS.
        const { data, error } = await supabase
            .from("messages")
            .select("sender_id")
            .eq("receiver_id", myUserId)
            .eq("is_read", false);

        if (error) {
            console.error("Error fetching unread counts", error);
            return;
        }

        const counts: Record<string, number> = {};
        data?.forEach((msg) => {
            counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
        });
        setUnreadCounts(counts);
    }, []);

    const markMessagesAsRead = useCallback(async (senderId: string, myUserId: string) => {
        // Optimistic update locally
        setUnreadCounts((prev) => ({
            ...prev,
            [senderId]: 0
        }));

        // Update DB
        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("sender_id", senderId)
            .eq("receiver_id", myUserId)
            .eq("is_read", false);

        if (error) {
            console.error("Error marking as read", error);
        }
    }, []);

    // 1. Initial Load: Get Current User & Staff List
    useEffect(() => {
        async function init() {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    return;
                }
                setCurrentUser(user.id);

                const { data: staffData } = await supabase
                    .from("user_roles")
                    .select("user_id, full_name, role");

                if (staffData) setUsers(staffData);

                // Fetch initial unread counts
                fetchUnreadCounts(user.id);

            } catch (err) {
                console.error("Init error", err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [fetchUnreadCounts]);

    // 2. Fetch Messages when User Selected
    useEffect(() => {
        if (!currentUser || !selectedUserId) {
            setMessages([]);
            return;
        }

        async function fetchMessages() {
            // Mark as read immediately when opening
            markMessagesAsRead(selectedUserId!, currentUser!);

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(`and(sender_id.eq.${currentUser},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUser})`)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Fetch msg error", error);
            } else {
                setMessages(data || []);
            }
        }

        fetchMessages();
    }, [currentUser, selectedUserId, markMessagesAsRead]);

    // 3. Realtime Subscription
    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase
            .channel("chat_channel")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMsg = payload.new as Message;

                    // Logic for Appending Messages to Chat Window
                    const activeUser = selectedUserRef.current;
                    const createsMyMessage = newMsg.sender_id === currentUser && newMsg.receiver_id === activeUser;
                    const receivesTheirMessage = newMsg.sender_id === activeUser && newMsg.receiver_id === currentUser;

                    if (createsMyMessage || receivesTheirMessage) {
                        setMessages((prev) => [...prev, newMsg]);

                        // If we are viewing the chat and receive a message, mark it read immediately
                        if (receivesTheirMessage && activeUser) {
                            markMessagesAsRead(activeUser, currentUser);
                        }
                    } else if (newMsg.receiver_id === currentUser) {
                        // Received message from someone else (not active chat)
                        setUnreadCounts((prev) => ({
                            ...prev,
                            [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, markMessagesAsRead]);

    const handleSendMessage = async (content: string) => {
        if (!currentUser || !selectedUserId) return;

        const { error } = await supabase.from("messages").insert({
            sender_id: currentUser,
            receiver_id: selectedUserId,
            content,
        }); // is_read defaults to false

        if (error) {
            alert("Failed to send message");
        }
    };

    const selectedUser = users.find(u => u.user_id === selectedUserId) || null;

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
            <div className={`w-full md:w-1/3 border-r border-gray-200 h-full ${selectedUserId ? 'hidden md:block' : 'block'}`}>
                <ChatSidebar
                    users={users}
                    selectedUserId={selectedUserId}
                    unreadCounts={unreadCounts}
                    onSelectUser={setSelectedUserId}
                    currentUserId={currentUser || ""}
                />
            </div>
            <div className={`w-full md:w-2/3 h-full ${selectedUserId ? 'block' : 'hidden md:block'}`}>
                <ChatWindow
                    messages={messages}
                    currentUserId={currentUser || ""}
                    selectedUser={selectedUser}
                    onSendMessage={handleSendMessage}
                    onBack={() => setSelectedUserId(null)}
                />
            </div>
        </div>
    );
}
