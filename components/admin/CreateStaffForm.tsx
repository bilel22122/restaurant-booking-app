"use client";

import { useActionState } from "react";
import { createStaffAccount } from "@/app/actions/createStaff";
import { Loader2, UserPlus } from "lucide-react";

export default function CreateStaffForm() {
    const [state, action, isPending] = useActionState(createStaffAccount, null);

    return (
        <div className="bg-white p-6 rounded-[var(--radius)] shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserPlus size={20} />
                Add New Staff Member
            </h3>

            <form action={action} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input name="name" type="text" required className="w-full p-2 border rounded-md" placeholder="e.g. John Doe" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                        <input name="phone" type="tel" className="w-full p-2 border rounded-md" placeholder="+1 234 567 890" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                        <input name="hourly_rate" type="number" step="0.50" min="0" className="w-full p-2 border rounded-md" placeholder="0.00" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input name="email" type="email" required className="w-full p-2 border rounded-md" placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input name="password" type="password" required className="w-full p-2 border rounded-md" placeholder="Min. 6 characters" minLength={6} />
                    </div>
                </div>

                {state?.message && (
                    <div className={`p-3 rounded-md text-sm ${state.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2 bg-[var(--primary)] text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {isPending && <Loader2 className="animate-spin w-4 h-4" />}
                    Create Account
                </button>
            </form>
        </div>
    );
}
