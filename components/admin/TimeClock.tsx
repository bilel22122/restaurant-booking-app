"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Play, CircleStop } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function TimeClock() {
    const [status, setStatus] = useState<'working' | 'not_working' | 'loading'>('loading');
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsed, setElapsed] = useState<string>("00:00:00");
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        checkStatus();
    }, []);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'working' && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = now.getTime() - startTime.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setElapsed(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }, 1000);
        } else {
            setElapsed("00:00:00");
        }
        return () => clearInterval(interval);
    }, [status, startTime]);

    const checkStatus = async () => {
        setStatus('loading');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Should handle this appropriately, maybe redirect or hide

        // Check Role
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
        if (roleData?.role === 'owner') {
            setIsVisible(false);
            return;
        }

        // Find the latest timesheet entry for this user that has no clock_out time
        const { data, error } = await supabase
            .from('timesheets')
            .select('*')
            .eq('user_id', user.id)
            .is('clock_out', null)
            .order('clock_in', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            setStatus('working');
            setCurrentSessionId(data.id);
            setStartTime(new Date(data.clock_in));
        } else {
            setStatus('not_working');
            setStartTime(null);
        }
    };

    const handleClockIn = async () => {
        setStatus('loading');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('timesheets')
            .insert({
                user_id: user.id,
                clock_in: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("Error clocking in:", error);
            setStatus('not_working'); // Revert state or show error
        } else {
            setStatus('working');
            setCurrentSessionId(data.id);
            setStartTime(new Date(data.clock_in));
        }
    };

    const handleClockOut = async () => {
        if (!currentSessionId) return;
        const previousStatus = status;
        setStatus('loading');

        const { error } = await supabase
            .from('timesheets')
            .update({
                clock_out: new Date().toISOString()
            })
            .eq('id', currentSessionId);

        if (error) {
            console.error("Error clocking out:", error);
            setStatus(previousStatus);
        } else {
            setStatus('not_working');
            setCurrentSessionId(null);
            setStartTime(null);
        }
    };

    if (!isVisible) return null;

    if (status === 'loading') {
        return (
            <div className="bg-white p-6 rounded-[var(--radius)] shadow-sm border border-gray-200 flex items-center justify-center min-h-[120px]">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[var(--radius)] shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    status === 'working' ? "bg-green-500" : "bg-gray-300"
                )} />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {status === 'working' ? 'Currently Working' : 'Off the Clock'}
                    </h3>
                    {status === 'working' && (
                        <p className="text-sm font-mono text-gray-500 tracking-wider">
                            {elapsed}
                        </p>
                    )}
                    {status === 'not_working' && (
                        <p className="text-sm text-gray-500">
                            Ready to start your shift?
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={status === 'working' ? handleClockOut : handleClockIn}
                className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow-md transition-all active:scale-95",
                    status === 'working'
                        ? "bg-red-500 hover:bg-red-600 ring-4 ring-red-100"
                        : "bg-green-600 hover:bg-green-700 ring-4 ring-green-100"
                )}
            >
                {status === 'working' ? (
                    <>
                        <CircleStop size={20} fill="currentColor" className="text-white/20" /> Clock Out
                    </>
                ) : (
                    <>
                        <Play size={20} fill="currentColor" className="text-white/20" /> Clock In
                    </>
                )}
            </button>
        </div>
    );
}
