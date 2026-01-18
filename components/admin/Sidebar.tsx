"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    UtensilsCrossed,
    MessageCircle,
    Users,
    Clock,
    LogOut,
    MessageSquare,
    ChefHat,
    ClipboardList
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<'owner' | 'staff' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRole() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data } = await supabase
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

    // Define all links
    const links = [
        // Common Links
        {
            name: "Bookings",
            href: "/admin",
            icon: LayoutDashboard,
            restricted: false
        },
        {
            name: "Team Chat",
            href: "/admin/chat",
            icon: MessageCircle,
            restricted: false
        },
        {
            name: "Clock In/Out",
            href: "/staff/dashboard",
            icon: Clock,
            restricted: false
        },
        // Owner Only Links
        {
            name: "Staff Management",
            href: "/admin/staff",
            icon: Users,
            restricted: true
        },
        {
            name: "Menu Manager",
            href: "/admin/menu",
            icon: UtensilsCrossed,
            restricted: true
        },
        {
            name: "Payroll/Timesheets",
            href: "/admin/timesheets",
            icon: ClipboardList,
            restricted: true
        },
        {
            name: "Reviews",
            href: "/admin/reviews",
            icon: MessageSquare,
            restricted: true
        }
    ];

    // Filter Logic
    // If loading or role is null (default to Staff view), show only restricted=false
    // If role is 'owner', show all.
    // If role is 'staff', show only restricted=false.

    const isOwner = role === 'owner';
    // Safe default: if loading, behave like staff (only common links)
    const filteredLinks = links.filter(link => {
        if (loading) return !link.restricted;
        if (isOwner) return true;
        return !link.restricted;
    });

    return (
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col sticky top-0 md:h-screen z-10 transition-all duration-300">
            <div className="mb-8 p-4 bg-[var(--primary)]/10 rounded-[var(--radius)]">
                <h2 className="text-xl font-bold text-[var(--primary)] tracking-tight">Admin Portal</h2>
                <p className="text-xs text-gray-500 capitalize">
                    {loading ? 'Loading...' : (role ? `${role} Access` : 'Staff Access')}
                </p>
            </div>

            <nav className="flex-1 space-y-1">
                {filteredLinks.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-[var(--primary)] text-white shadow-md relative overflow-hidden"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            {/* Active Indicator (optional design touch) */}
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />}

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
    );
}
