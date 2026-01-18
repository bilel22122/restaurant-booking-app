"use client";

import { useState } from "react";
import { Phone, DollarSign, Clock, History, PlusCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { differenceInMinutes, isThisWeek, parseISO } from "date-fns";

export interface StaffMember {
    id: string; // user_id
    full_name: string;
    role: 'staff' | 'owner';
    phone_number?: string;
    hourly_rate?: number;
    email: string; // from auth
}

export interface Timesheet {
    id: string;
    user_id: string;
    clock_in: string;
    clock_out: string | null;
    is_manual?: boolean;
}

interface StaffPayrollCardProps {
    staff: StaffMember;
    timesheets: Timesheet[];
    onRefresh: () => void;
    onViewHistory: (staffId: string) => void;
}

export default function StaffPayrollCard({ staff, timesheets, onRefresh, onViewHistory }: StaffPayrollCardProps) {
    const [rate, setRate] = useState<string>(staff.hourly_rate?.toString() || "");
    const [isEditingRate, setIsEditingRate] = useState(false);

    // --- Derived Stats (This Week) ---
    const weeklyStats = (() => {
        let totalMinutes = 0;
        const currentRate = parseFloat(rate) || 0;
        let isWorking = false;

        timesheets.forEach(ts => {
            // Check if currently working
            if (!ts.clock_out) {
                isWorking = true;
                return;
            }

            const start = parseISO(ts.clock_in);
            const end = parseISO(ts.clock_out);

            // Filter for THIS WEEK
            if (isThisWeek(start, { weekStartsOn: 1 })) { // Monday start
                totalMinutes += differenceInMinutes(end, start);
            }
        });

        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const totalHoursDecimal = totalMinutes / 60;
        const estimatedPay = totalHoursDecimal * currentRate;

        return {
            hoursStr: `${hours}h ${mins}m`,
            estPay: estimatedPay.toFixed(2),
            isWorking
        };
    })();

    // --- Handlers ---
    const handleRateBlur = async () => {
        setIsEditingRate(false);
        const newRate = parseFloat(rate);
        if (isNaN(newRate) || newRate === staff.hourly_rate) return;

        try {
            const { error } = await supabase
                .from('user_roles')
                .update({ hourly_rate: newRate }) // @ts-ignore
                .eq('user_id', staff.id);

            if (error) {
                console.error("Error updating rate", error);
                setRate(staff.hourly_rate?.toString() || ""); // Revert
            } else {
                onRefresh(); // Refresh parent data
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{staff.full_name || staff.email}</h3>
                    <p className="text-sm text-gray-500 capitalize">{staff.role}</p>
                </div>
                {weeklyStats.isWorking && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        Working Now
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-5 flex-1 space-y-6">

                {/* Contact & Rate */}
                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</label>
                        {staff.phone_number ? (
                            <a href={`tel:${staff.phone_number}`} className="flex items-center gap-2 text-sm text-[var(--primary)] font-medium hover:underline">
                                <Phone size={14} />
                                {staff.phone_number}
                            </a>
                        ) : (
                            <span className="text-sm text-gray-400 italic flex items-center gap-2">
                                <Phone size={14} /> No phone
                            </span>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block text-right">Hourly Rate</label>
                        <div className="relative w-24 ml-auto">
                            <DollarSign size={14} className="absolute left-2 top-2.5 text-gray-400" />
                            <input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                onBlur={handleRateBlur}
                                onFocus={() => setIsEditingRate(true)}
                                placeholder="0.00"
                                className="w-full text-right pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all font-semibold text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Weekly Stats */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock size={12} /> Hours this week</p>
                        <p className="font-bold text-gray-900 text-lg">{weeklyStats.hoursStr}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={12} /> Est. Pay</p>
                        <p className="font-bold text-green-700 text-lg">${weeklyStats.estPay}</p>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/30 mt-auto">
                <button
                    onClick={() => onViewHistory(staff.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                    <History size={14} /> View History
                </button>
            </div>
        </div>
    );
}
