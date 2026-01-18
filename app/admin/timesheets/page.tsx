"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Users, Search } from "lucide-react";
import StaffPayrollCard, { StaffMember, Timesheet } from "@/components/admin/StaffPayrollCard";
import ShiftHistoryDrawer from "@/components/admin/ShiftHistoryDrawer";

export default function TimesheetsPage() {
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [historyStaffId, setHistoryStaffId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch User Roles (which contains extra fields now presumably)
            // Note: In a real app, 'full_name' might be in auth.users metadata, 
            // but the prompt says 'user_roles' now has 'full_name', 'hourly_rate', 'phone_number'.
            // We'll try to fetch from 'user_roles' directly.
            const { data: roles, error: rolesError } = await supabase
                .from('user_roles')
                .select('*')
                .eq('role', 'staff');

            if (rolesError) throw rolesError;

            // 2. Fetch Timesheets (All or just recent? Let's fetch all for now, or last 30 days)
            // For correct "This Week" calculation, we need at least recent ones.
            const { data: sheets, error: sheetsError } = await supabase
                .from('timesheets')
                .select('*')
                .order('clock_in', { ascending: false });

            if (sheetsError) throw sheetsError;

            // 3. Map to StaffMember interface
            // If the prompt implies we added 'full_name' to user_roles, we use that.
            // If not, we might need to fetch auth.users. But assuming prompt is truth:
            const mappedStaff: StaffMember[] = (roles || []).map((r: any) => ({
                id: r.user_id,
                full_name: r.full_name || 'Unknown Staff', // Fallback
                role: r.role,
                phone_number: r.phone_number,
                hourly_rate: r.hourly_rate,
                email: '' // We might not get email if it's strictly in auth.users, but that's fine for the card
            }));

            // If we really need email or names from Auth (fallback if DB columns are empty):
            // We technically can't list all users from client-side easily without an Edge Function or Admin API.
            // But if the user put 'full_name' in `user_roles`, we are good!

            setStaffList(mappedStaff);
            setTimesheets(sheets as Timesheet[]);

        } catch (error) {
            console.error("Error loading timesheet data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredStaff = staffList.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Staff & Payroll</h1>
                    <p className="text-gray-500 mt-1">Manage shifts, hourly rates, and payroll estimates.</p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
                </div>
            ) : (
                <>
                    {filteredStaff.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-12 text-center text-gray-500">
                            <Users size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No staff found</p>
                            <p className="text-sm">Ensure you have users with the 'staff' role.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredStaff.map((staff) => (
                                <StaffPayrollCard
                                    key={staff.id}
                                    staff={staff}
                                    timesheets={timesheets.filter(t => t.user_id === staff.id)}
                                    onRefresh={fetchData}
                                    onViewHistory={(id) => setHistoryStaffId(id)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <ShiftHistoryDrawer
                isOpen={!!historyStaffId}
                onClose={() => setHistoryStaffId(null)}
                staff={staffList.find(s => s.id === historyStaffId) || null}
                timesheets={timesheets.filter(t => t.user_id === historyStaffId)}
            />
        </div>
    );
}
