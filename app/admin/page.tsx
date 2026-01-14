
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Check, X, Clock, Loader2, Calendar, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import TimeClock from "@/components/admin/TimeClock";

// Define Booking type manually to match DB
type Booking = {
    id: string;
    created_at: string;
    customer_name: string;
    phone_number: string;
    booking_date: string;
    booking_time: string;
    party_size: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'seated' | 'no_show';
    notes?: string;
};

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'today' | 'upcoming' | 'all'>('today');
    const [stats, setStats] = useState({ expectedGuests: 0 });

    const fetchBookings = async () => {
        setLoading(true);
        const todayStr = new Date().toISOString().split('T')[0];

        let query = supabase
            .from('bookings')
            .select('*')
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true });

        if (filter === 'today') {
            query = query.eq('booking_date', todayStr);
        } else if (filter === 'upcoming') {
            query = query.gte('booking_date', todayStr); // Includes today? "Upcoming" usually means future. Let's say > today for strict "Upcoming", but user might want "From Today". 
            // The prompt says: [Today] (Default), [Upcoming] (Future dates), [All].
            // So Today = = today. Upcoming = > today.
            query = query.gt('booking_date', todayStr);
        }
        // 'all' -> no filter on date (or maybe sort desc?) - sticking to ascending for now as it's easier to find next bookings.

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching bookings:", error);
        } else {
            setBookings(data as Booking[]);

            // Calculate Stats: Total Guests Expected Today (sum of party_size for today's 'confirmed' bookings)
            // We might need to fetch *today's* bookings specifically if we are in 'upcoming' or 'all' mode to keep the stat accurate?
            // Or just fetch today's stats separately?
            // Let's do a separate calculation or quick filter if we have the data. 
            // If the user views 'Upcoming', we don't have 'Today's' data in `data`. 
            // So let's run a separate lightweight query for the stats or just fetch all today's data once.
            // For simplicity/performance balance: I'll trigger a separate count query for the stats.
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('bookings')
            .select('party_size')
            .eq('booking_date', todayStr)
            .eq('status', 'confirmed');

        if (!error && data) {
            const total = data.reduce((acc, curr) => acc + curr.party_size, 0);
            setStats({ expectedGuests: total });
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchStats(); // Update stats whenever we refresh logic, though technically only needed periodically.
    }, [filter]);

    const updateStatus = async (id: string, newStatus: Booking['status']) => {
        // Optimistic update
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        // Re-fetch stats if status changed to/from confirmed for today
        // But for UI speed we skip waiting for stats update instantly, eventually it syncs.

        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error("Error updating status:", error);
            fetchBookings();
        } else {
            fetchStats(); // Update stats after change
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header & Stats */}
                <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 bg-white p-6 rounded-[var(--radius)] shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--foreground)]">Command Center</h1>
                        <p className="text-gray-500 text-sm">Manage bookings and guest flow.</p>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-[var(--radius)] flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-900">{stats.expectedGuests}</div>
                            <div className="text-xs text-blue-700 font-medium uppercase tracking-wide">Expected Today</div>
                        </div>
                    </div>
                </header>

                {/* Time Clock */}
                <TimeClock />

                {/* Filters */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-[var(--radius)] shadow-sm w-fit">
                    {(['today', 'upcoming', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize",
                                filter === f
                                    ? "bg-[var(--primary)] text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-200 mx-2" />
                    <button onClick={() => { fetchBookings(); fetchStats(); }} className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors" title="Refresh">
                        <Loader2 className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>
                ) : bookings.length === 0 ? (
                    <div className="text-center p-12 text-gray-500 bg-white rounded-[var(--radius)] shadow-sm">
                        No bookings found for this filter.
                    </div>
                ) : (
                    <div className="bg-white rounded-[var(--radius)] shadow-sm overflow-hidden border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Time</th>
                                    <th className="p-4 font-semibold text-gray-600">Customer</th>
                                    <th className="p-4 font-semibold text-gray-600">Contact</th>
                                    <th className="p-4 font-semibold text-gray-600 text-center">Guests</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map((booking) => {
                                    const isSeated = booking.status === 'seated';
                                    return (
                                        <tr
                                            key={booking.id}
                                            className={cn(
                                                "transition-colors",
                                                isSeated ? "bg-green-50/50 hover:bg-green-50" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <td className="p-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize shadow-sm border",
                                                    booking.status === 'confirmed' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        booking.status === 'seated' ? "bg-green-100 text-green-800 border-green-200" :
                                                            booking.status === 'pending' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                                booking.status === 'no_show' ? "bg-red-50 text-red-700 border-red-200" :
                                                                    "bg-gray-100 text-gray-600 border-gray-200"
                                                )}>
                                                    {booking.status === 'no_show' ? 'No Show' : booking.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className={cn("font-medium", isSeated ? "text-green-900" : "text-gray-900")}>
                                                        {booking.booking_time.slice(0, 5)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{format(new Date(booking.booking_date), 'MMM d')}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    {booking.customer_name}
                                                    {booking.notes && (
                                                        <div className="group relative">
                                                            <MessageSquare size={16} className="text-yellow-500 cursor-help" />
                                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-normal">
                                                                {booking.notes}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm">
                                                {booking.phone_number}
                                            </td>
                                            <td className="p-4 text-gray-600 text-center font-medium">
                                                {booking.party_size}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    {/* Pending Actions */}
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(booking.id, 'confirmed')}
                                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors shadow-sm"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(booking.id, 'cancelled')}
                                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Confirmed Actions */}
                                                    {booking.status === 'confirmed' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(booking.id, 'seated')}
                                                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                                                            >
                                                                <Check size={14} /> Seated
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(booking.id, 'no_show')}
                                                                className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded hover:bg-red-200 transition-colors shadow-sm"
                                                            >
                                                                No Show
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(booking.id, 'cancelled')}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Other States Actions (Reset) */}
                                                    {['seated', 'cancelled', 'no_show'].includes(booking.status) && (
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'pending')}
                                                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
