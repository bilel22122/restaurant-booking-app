"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MenuCard from "@/components/MenuCard";
import Link from "next/link";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { restaurantConfig } from "@/restaurant.config";

type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url?: string;
};

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        async function fetchMenu() {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('is_available', true)
                .order('category', { ascending: true })
                .order('name', { ascending: true });

            if (error) {
                console.error("Error fetching menu:", error);
            } else if (data) {
                setMenuItems(data as MenuItem[]);
                const uniqueCategories = ["All", ...Array.from(new Set(data.map(item => item.category))).sort()];
                setCategories(uniqueCategories);
            }
            setLoading(false);
        }

        fetchMenu();
    }, []);

    const filteredItems = activeCategory === "All"
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Section */}
            <section className="relative h-[40vh] bg-gray-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80")' }}
                />
                <div className="relative z-20 text-center px-4">
                    <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-md mb-4">
                        Our Delicious Offerings
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light">
                        Crafted with passion, seasoned with love.
                    </p>
                </div>
            </section>

            {/* Category Filter Bar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 pb-2 pt-4">
                <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
                    <div className="flex space-x-2 md:justify-center min-w-max pb-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category
                                        ? "bg-[var(--primary)] text-white shadow-md scale-105"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
                    </div>
                ) : (
                    <>
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <p className="text-xl">No items found in this category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                                {filteredItems.map((item) => (
                                    <MenuCard
                                        key={item.id}
                                        name={item.name}
                                        description={item.description}
                                        price={item.price}
                                        image_url={item.image_url}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer CTA */}
            <section className="bg-white py-16 border-t border-gray-100 mt-auto">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">
                        Ready to Taste?
                    </h2>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--foreground)] text-white text-lg font-semibold rounded-[var(--radius)] hover:bg-gray-800 transition-all hover:-translate-y-1 shadow-lg"
                    >
                        <UtensilsCrossed size={20} />
                        Book Your Table Now
                    </Link>
                </div>
            </section>
        </main>
    );
}
