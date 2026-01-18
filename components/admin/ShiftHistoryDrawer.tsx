"use client";

import { useEffect, useState } from "react";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { X, Clock, CalendarDays, AlertCircle } from "lucide-react";
import { StaffMember, Timesheet } from "./StaffPayrollCard";
import { cn } from "@/lib/utils";

interface ShiftHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    staff: StaffMember | null;
    timesheets: Timesheet[];
}

export default function ShiftHistoryDrawer({ isOpen, onClose, staff, timesheets }: ShiftHistoryDrawerProps) {
    // Prevent scrolling on body when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!staff) return null;

    // Sort timesheets: Newest first
    const sortedTimesheets = [...timesheets].sort((a, b) =>
        new Date(b.clock_in).getTime() - new Date(a.clock_in).getTime()
    );

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{staff.full_name}</h2>
                        <p className="text-sm text-gray-500">Shift History</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {sortedTimesheets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <HistoryPlaceholder />
                            <p className="mt-2 text-sm">No shifts recorded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedTimesheets.map((ts) => {
                                const start = parseISO(ts.clock_in);
                                const end = ts.clock_out ? parseISO(ts.clock_out) : null;

                                let durationStr = "Running...";
                                if (end) {
                                    const totalMins = differenceInMinutes(end, start);
                                    const h = Math.floor(totalMins / 60);
                                    const m = totalMins % 60;
                                    durationStr = `${h}h ${m}m`;
                                }

                                return (
                                    <div key={ts.id} className="p-4 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={14} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {format(start, 'EEE, MMM d, yyyy')}
                                                </span>
                                            </div>
                                            {ts.is_manual && (
                                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wide rounded border border-amber-100">
                                                    Manual
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="text-gray-500 flex items-center gap-2">
                                                <Clock size={14} />
                                                {format(start, 'h:mm a')} - {end ? format(end, 'h:mm a') : 'Now'}
                                            </div>
                                            <div className={cn(
                                                "font-mono font-medium",
                                                end ? "text-gray-700" : "text-green-600 animate-pulse"
                                            )}>
                                                {durationStr}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                    Showing {sortedTimesheets.length} records
                </div>
            </div>
        </>
    );
}

function HistoryPlaceholder() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
    )
}
