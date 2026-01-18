"use client";

import { useState } from "react";
import { Loader2, Calendar, Clock, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface ManualShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffId: string;
    onSuccess: () => void;
}

export default function ManualShiftModal({ isOpen, onClose, staffId, onSuccess }: ManualShiftModalProps) {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Construct timestamp strings (ISO)
            // Note: This constructs local time based on the input.
            // PostgreSQL timestamptz expects ISO string.
            const startDateTime = new Date(`${date}T${startTime}:00`);
            const endDateTime = new Date(`${date}T${endTime}:00`);

            const { error } = await supabase.from('timesheets').insert({
                user_id: staffId,
                clock_in: startDateTime.toISOString(),
                clock_out: endDateTime.toISOString(),
                // @ts-ignore - Assuming column exists as per requirements
                is_manual: true,
                // @ts-ignore - Assuming column exists as per requirements
                admin_notes: notes
            });

            if (error) {
                console.error("Error creating manual shift:", error);
                alert("Failed to create shift. Check console.");
            } else {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Add Manual Shift</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10 w-full rounded-md border border-gray-300 py-2 text-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="pl-10 w-full rounded-md border border-gray-300 py-2 text-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="time"
                                    required
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="pl-10 w-full rounded-md border border-gray-300 py-2 text-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                            rows={3}
                            placeholder="Reason for manual entry..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                        >
                            {saving && <Loader2 size={16} className="animate-spin" />}
                            Save Shift
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
