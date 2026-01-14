import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { format, differenceInMinutes } from 'date-fns'
import { redirect } from 'next/navigation'

export default async function TimesheetsPage() {
    const cookieStore = await cookies();

    // 1. Create standard client for Auth check
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

    // 3. Admin client for data fetch (if needed, though timesheets RLS usually might allow owner read)
    // Actually, earlier RLS said "Owners can view all".
    // So if I am authenticated as owner, I *can* use supabaseUserClient for fetching timesheets!
    // BUT, I need to fetch *users* list to map names, which requires Admin client.
    // So I will use Admin client for simplicity and consistency.
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: { getAll() { return [] }, setAll() { } }
        }
    );

    // Fetch all timesheets
    const { data: timesheets, error } = await supabaseAdmin
        .from('timesheets')
        .select('*')
        .order('clock_in', { ascending: false });

    // Fetch users for mapping names
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error("Error fetching timesheets", error);
        return <div>Error loading timesheets.</div>;
    }

    // Process data
    const rows = timesheets?.map(ts => {
        const userObj = users?.find(u => u.id === ts.user_id);
        const start = new Date(ts.clock_in);
        const end = ts.clock_out ? new Date(ts.clock_out) : null;

        let duration = 'Running...';
        let totalMinutes = 0;

        if (end) {
            totalMinutes = differenceInMinutes(end, start);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            duration = `${hours}h ${mins}m`;
        }

        return {
            id: ts.id,
            name: userObj?.user_metadata?.name || userObj?.email || 'Unknown',
            date: format(start, 'MMM d, yyyy'),
            clockIn: format(start, 'HH:mm'),
            clockOut: end ? format(end, 'HH:mm') : '-',
            duration,
            isComplete: !!end
        };
    }) || [];

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Timesheets</h1>
                    <p className="text-gray-500 text-sm">Track staff hours and shifts.</p>
                </div>
            </header>

            <div className="bg-white rounded-[var(--radius)] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="p-4">Staff Member</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Clock In</th>
                            <th className="p-4">Clock Out</th>
                            <th className="p-4 text-right">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{row.name}</td>
                                    <td className="p-4 text-gray-500">{row.date}</td>
                                    <td className="p-4 text-gray-900">{row.clockIn}</td>
                                    <td className="p-4 text-gray-900">{row.clockOut}</td>
                                    <td className="p-4 text-right font-mono">
                                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${!row.isComplete
                                            ? 'bg-blue-100 text-blue-700 animate-pulse'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {row.duration}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
