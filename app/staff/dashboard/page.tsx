"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Clock, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function StaffDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [status, setStatus] = useState<'clocked_in' | 'clocked_out'>('clocked_out');
    const [lastTimesheetId, setLastTimesheetId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch User and Status
    useEffect(() => {
        async function init() {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error || !user) {
                    router.push('/portal-v2-auth');
                    return;
                }
                setUser(user);

                // Check latest timesheet
                const { data: timesheets, error: tsError } = await supabase
                    .from('timesheets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('clock_in', { ascending: false })
                    .limit(1);

                if (tsError) {
                    console.error("Error fetching timesheets", tsError);
                } else if (timesheets && timesheets.length > 0) {
                    const latest = timesheets[0];
                    if (!latest.clock_out) {
                        setStatus('clocked_in');
                        setLastTimesheetId(latest.id);
                    } else {
                        setStatus('clocked_out');
                    }
                } else {
                    setStatus('clocked_out');
                }

            } catch (err) {
                console.error("Init Error", err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [router]);

    const handleClockIn = async () => {
        if (!user) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('timesheets')
                .insert({
                    user_id: user.id,
                    clock_in: new Date().toISOString()
                });

            if (error) throw error;

            // Re-fetch or manually update state
            setStatus('clocked_in');
            // Fetching ID might be needed for next clock out, so let's refetch logic or just reload?
            // A reload is clean but slower. Let's refetch the latest ID.
            const { data } = await supabase
                .from('timesheets')
                .select('id')
                .eq('user_id', user.id)
                .order('clock_in', { ascending: false })
                .limit(1)
                .single();
            if (data) setLastTimesheetId(data.id);

        } catch (err) {
            console.error("Clock In Error", err);
            alert("Failed to clock in");
        } finally {
            setActionLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!user || !lastTimesheetId) return;
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('timesheets')
                .update({
                    clock_out: new Date().toISOString()
                })
                .eq('id', lastTimesheetId);

            if (error) throw error;

            setStatus('clocked_out');
            setLastTimesheetId(null);

        } catch (err) {
            console.error("Clock Out Error", err);
            alert("Failed to clock out");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/portal-v2-auth');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden relative">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white text-center relative">
                    <button
                        onClick={handleSignOut}
                        className="absolute top-4 right-4 p-2 bg-blue-700/50 hover:bg-blue-700 rounded-full transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                    <h1 className="text-2xl font-bold">Staff Dashboard</h1>
                    <p className="opacity-90 mt-1">Welcome, {user?.user_metadata?.name || 'Staff Member'}</p>
                </div>

                <div className="p-8 text-center space-y-8">
                    {/* Time Display */}
                    <div className="space-y-2">
                        <p className="text-gray-500 uppercase tracking-widest text-xs font-semibold">Current Time</p>
                        <div className="text-4xl font-mono font-bold text-gray-800">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <p className="text-sm text-gray-500">{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>

                    {/* Status Card */}
                    <div className={cn(
                        "p-4 rounded-xl border-2 flex items-center justify-center gap-3",
                        status === 'clocked_in'
                            ? "border-green-100 bg-green-50 text-green-700"
                            : "border-gray-100 bg-gray-50 text-gray-500"
                    )}>
                        {status === 'clocked_in' ? (
                            <>
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-semibold">Currently Clocked In</span>
                            </>
                        ) : (
                            <>
                                <div className="w-3 h-3 rounded-full bg-gray-400" />
                                <span className="font-medium">Currently Clocked Out</span>
                            </>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        {status === 'clocked_out' ? (
                            <button
                                onClick={handleClockIn}
                                disabled={actionLoading}
                                className="w-full group relative flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : <Clock size={24} />}
                                <span>Clock In Now</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleClockOut}
                                disabled={actionLoading}
                                className="w-full group relative flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : <LogOut size={24} />}
                                <span>Clock Out</span>
                            </button>
                        )}
                        <p className="mt-4 text-xs text-gray-400">
                            {status === 'clocked_out'
                                ? "Ready to start your shift?"
                                : "Don't forget to report any overtime."}
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
                    <button onClick={() => router.push('/admin')} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        View Bookings
                    </button>
                    <button onClick={() => router.push('/admin/chat')} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        Team Chat
                    </button>
                </div>
            </div>
        </div>
    );
}
