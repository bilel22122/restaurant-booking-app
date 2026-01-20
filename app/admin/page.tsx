"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { format, isToday, parseISO, isFuture } from "date-fns";
import { Loader2, Users, Armchair, Clock, CalendarDays, RefreshCw } from "lucide-react";
import BookingRow, { Booking, BookingStatus } from "@/components/admin/BookingRow";
import InstallAppButton from "@/components/admin/InstallAppButton";

type FilterType = 'today' | 'upcoming' | 'all';

export default function ReservationsDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('today');
    const [role, setRole] = useState<'owner' | 'staff' | null>(null);
    const [now] = useState(new Date()); // Stable reference for initial render

    // --- Real-time Subscription & Initial Fetch ---
    useEffect(() => {
        fetchBookings();
        fetchRole();

        const channel = supabase
            .channel('reservations-dashboard-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'bookings' // Make sure this matches your DB table name
                },
                (payload) => {
                    // Handle real-time updates by re-fetching or optimistic updates.
                    // For absolute correctness with sorting and complex filters, re-fetching is safest for MVP.
                    // Or we can manually merge:
                    console.log('Real-time change received:', payload);

                    if (payload.eventType === 'INSERT') {
                        setBookings(prev => [...prev, payload.new as Booking]);
                    } else if (payload.eventType === 'UPDATE') {
                        setBookings(prev => prev.map(b => b.id === payload.new.id ? payload.new as Booking : b));
                    } else if (payload.eventType === 'DELETE') {
                        setBookings(prev => prev.filter(b => b.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchBookings() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('booking_date', { ascending: true })
                .order('booking_time', { ascending: true });

            if (error) {
                console.error('Error fetching bookings:', error);
            } else {
                setBookings((data as Booking[]) || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchRole() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
            if (data) setRole(data.role as 'owner' | 'staff');
        }
    }

    // --- Derived State (Stats & Filtering) ---
    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            // Construct a full date object for comparison
            // Note: booking.booking_date is YYYY-MM-DD string
            const bookingDate = parseISO(booking.booking_date);

            if (filter === 'today') {
                return isToday(bookingDate);
            } else if (filter === 'upcoming') {
                // Include today and future
                return isToday(bookingDate) || isFuture(bookingDate);
            }
            return true; // 'all'
        });
    }, [bookings, filter]);

    // Sort: Today's bookings should probably clarify time ordering.
    // The API fetch already ordered by date/time, so the array is sorted.
    // We just need to make sure the filter preserves that order (Array.filter does).

    const stats = useMemo(() => {
        // Stats based on the *filtered* view or *total* view? 
        // Usually dashboard stats reflect the active filter context (e.g. "Today's stats").
        // Let's go with filtered view for context relevance.
        const total = filteredBookings.length;
        const seated = filteredBookings.filter(b => b.status === 'seated').length;
        const pending = filteredBookings.filter(b => b.status === 'pending').length;

        return { total, seated, pending };
    }, [filteredBookings]);


    return (
        <div className="space-y-8">
            {role === 'owner' && <InstallAppButton />}
            {/* Header & Stats */}
            <header className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] tracking-tight">Reservations</h1>
                        <p className="text-sm md:text-base text-gray-500 mt-1">Manage daily bookings and traffic flow.</p>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-[var(--radius)] border border-gray-200 shadow-sm">
                        {(['today', 'upcoming', 'all'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f
                                    ? 'bg-[var(--primary)] text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bookings</p>
                            <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                            <Armchair size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Guests Seated</p>
                            <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.seated}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                            <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main List */}
            <div className="bg-white rounded-[var(--radius)] shadow-sm border border-gray-100 min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 size={40} className="animate-spin mb-4 text-[var(--primary)]" />
                        <p>Loading reservations...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <CalendarDays size={32} />
                        </div>
                        <p className="text-lg font-medium text-gray-600">No bookings found</p>
                        <p className="text-sm mt-1">Try adjusting the filter or add a new reservation.</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {filteredBookings.map((booking) => (
                            <BookingRow key={booking.id} booking={booking} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
