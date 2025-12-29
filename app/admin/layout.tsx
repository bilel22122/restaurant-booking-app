"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UtensilsCrossed } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Bookings",
            href: "/admin",
            icon: LayoutDashboard
        },
        {
            name: "Menu Manager",
            href: "/admin/menu",
            icon: UtensilsCrossed
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar / Nav */}
            <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
                <div className="mb-8 p-4 bg-[var(--primary)]/10 rounded-[var(--radius)]">
                    <h2 className="text-xl font-bold text-[var(--primary)] tracking-tight">Admin Portal</h2>
                    <p className="text-xs text-gray-500">Restaurant Management</p>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
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
