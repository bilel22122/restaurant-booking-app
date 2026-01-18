"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, CheckCircle, XCircle, Clock, Armchair, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export type BookingStatus = 'pending' | 'confirmed' | 'seated' | 'finished' | 'cancelled';

export interface Booking {
    id: string;
    customer_name: string;
    phone_number: string;
    booking_date: string; // YYYY-MM-DD
    booking_time: string; // HH:MM:SS
    party_size: number;
    status: BookingStatus;
    notes?: string;
    created_at: string;
}

interface BookingRowProps {
    booking: Booking;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: any }> = {
    pending: { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle },
    seated: { label: "Seated", color: "bg-green-50 text-green-700 border-green-200", icon: Armchair },
    finished: { label: "Finished", color: "bg-gray-100 text-gray-700 border-gray-200", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

export default function BookingRow({ booking }: BookingRowProps) {
    const [updating, setUpdating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Optimistic UI could be handled by parent, but local state works for immediate feedback if not strictly controlled
    // However, since we have real-time sync in the parent, we might just rely on props updates.
    // We'll trust the parent re-render from subscription for the UI update to keep it simple and robust.

    const handleStatusChange = async (newStatus: BookingStatus) => {
        if (newStatus === booking.status) return;

        setUpdating(true);
        setIsOpen(false);

        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', booking.id);

            if (error) {
                console.error("Failed to update status by row", error);
                alert("Failed to update status");
            }
        } catch (e) {
            console.error("Error updating status", e);
        } finally {
            setUpdating(false);
        }
    };

    const currentConfig = statusConfig[booking.status] || statusConfig.pending;

    return (
        <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all gap-4">
            {/* Info Section */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold shrink-0">
                        {booking.party_size}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 truncate">{booking.customer_name}</h4>
                        <div className="flex items-center text-sm text-gray-500 gap-3 mt-0.5">
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {format(new Date(`${booking.booking_date}T${booking.booking_time}`), 'h:mm a')}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="truncate">{booking.phone_number}</span>
                        </div>
                    </div>
                </div>
                {booking.notes && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                        Note: {booking.notes}
                    </div>
                )}
            </div>

            {/* Actions / Status */}
            <div className="flex items-center gap-4 shrink-0">

                {/* Status Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={updating}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                            currentConfig.color,
                            "hover:opacity-80 disabled:opacity-50"
                        )}
                    >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : <currentConfig.icon size={14} />}
                        {currentConfig.label}
                        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
                    </button>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                {(Object.keys(statusConfig) as BookingStatus[]).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        className={cn(
                                            "w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50",
                                            booking.status === status ? "bg-gray-50 font-medium text-[var(--primary)]" : "text-gray-600"
                                        )}
                                    >
                                        {statusConfig[status].label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
