"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, AlertCircle, Quote, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Review {
    id: string;
    created_at: string;
    rating: number;
    comment: string;
    customer_name?: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAccess() {
            setRoleLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
                if (data?.role !== 'owner') {
                    router.push('/admin');
                } else {
                    setRoleLoading(false);
                    fetchReviews();
                }
            } else {
                router.push('/login');
            }
        }
        checkAccess();
    }, [router]);

    async function fetchReviews() {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReviews(data);
        }
        setLoading(false);
    }

    if (roleLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (loading) return <div className="p-8">Loading reviews...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => {
                    const isUrgent = review.rating <= 2;
                    return (
                        <div
                            key={review.id}
                            className={cn(
                                "bg-white p-6 rounded-[var(--radius)] shadow-sm border space-y-4 flex flex-col h-full",
                                isUrgent ? "border-red-300 ring-1 ring-red-100" : "border-gray-200"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={16}
                                            className={cn(
                                                "fill-current",
                                                star <= review.rating ? "text-yellow-400" : "text-gray-200"
                                            )}
                                        />
                                    ))}
                                </div>
                                {isUrgent && (
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                        <AlertCircle size={12} /> Urgent
                                    </span>
                                )}
                            </div>

                            <div className="relative pl-6 flex-1">
                                <Quote className="absolute left-0 top-0 text-gray-200 w-4 h-4 transform -scale-x-100" />
                                <p className="text-gray-700 italic text-sm mb-2">{review.comment}</p>
                            </div>

                            {review.customer_name && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                    <User size={12} /> {review.customer_name}
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                                <span>{format(new Date(review.created_at), "MMM d, yyyy • h:mm a")}</span>
                                <span className="font-mono">ID: {review.id.slice(0, 4)}</span>
                            </div>
                        </div>
                    );
                })}

                {reviews.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No reviews submitted yet.
                    </div>
                )}
            </div>
        </div>
    );
}
