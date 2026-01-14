"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UtensilsCrossed, MessageSquare, Users, Clock, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<'owner' | 'staff' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRole() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    // Middleware should handle this, but double check
                    return;
                }

                const { data, error } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setRole(data.role as 'owner' | 'staff');
                }
            } catch (e) {
                console.error("Error fetching role", e);
            } finally {
                setLoading(false);
            }
        }
        fetchRole();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const navItems = [
        {
            name: "Bookings",
            href: "/admin",
            icon: LayoutDashboard,
            roles: ['owner', 'staff']
        },
        {
            name: "Menu Manager",
            href: "/admin/menu",
            icon: UtensilsCrossed,
            roles: ['owner']
        },
        {
            name: "Reviews",
            href: "/admin/reviews",
            icon: MessageSquare,
            roles: ['owner']
        },
        {
            name: "Staff Management",
            href: "/admin/staff",
            icon: Users,
            roles: ['owner']
        },
        {
            name: "Timesheets",
            href: "/admin/timesheets",
            icon: Clock,
            roles: ['owner']
        }
    ];

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar / Nav */}
            <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col sticky top-0 md:h-screen z-10">
                <div className="mb-8 p-4 bg-[var(--primary)]/10 rounded-[var(--radius)]">
                    <h2 className="text-xl font-bold text-[var(--primary)] tracking-tight">Admin Portal</h2>
                    <p className="text-xs text-gray-500 capitalize">{role ? `${role} Access` : 'Restaurant MGMT'}</p>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.filter(item => role && item.roles.includes(role)).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[var(--primary)] text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-gray-100 mt-auto">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-[var(--radius)] text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
