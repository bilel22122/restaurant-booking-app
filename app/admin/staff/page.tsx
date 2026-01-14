import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import CreateStaffForm from "@/components/admin/CreateStaffForm";
import { Users, Mail } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function StaffPage() {
    const cookieStore = await cookies();

    // 1. Create standard client to check current user context
    const supabaseUserClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { }
            }
        }
    );

    const { data: { user } } = await supabaseUserClient.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. Check Role
    const { data: roleData } = await supabaseUserClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (roleData?.role !== 'owner') {
        redirect('/admin');
    }

    // 3. Admin client to fetch staff list details (Using Service Role Key)
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: { getAll() { return [] }, setAll() { } }
        }
    );

    // Fetch staff roles
    const { data: staffRoles } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'staff');

    // Fetch user details for these IDs
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    // Map data
    const staffList = staffRoles?.map(role => {
        const userObj = users?.find(u => u.id === role.user_id);
        return {
            id: role.user_id,
            email: userObj?.email,
            name: userObj?.user_metadata?.name || 'N/A',
            last_sign_in: userObj?.last_sign_in_at
        };
    }) || [];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Staff Management</h1>
                <p className="text-gray-500 text-sm">Create and view staff accounts.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Create Form */}
                <div className="lg:col-span-1">
                    <CreateStaffForm />
                </div>

                {/* Right: List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[var(--radius)] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Users size={18} /> Current Staff ({staffList.length})
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {staffList.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-500">
                                                No staff members found.
                                            </td>
                                        </tr>
                                    ) : (
                                        staffList.map((staff) => (
                                            <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-medium text-gray-900">{staff.name}</td>
                                                <td className="p-4 text-gray-500 flex items-center gap-2">
                                                    <Mail size={14} /> {staff.email}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
