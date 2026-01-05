"use client";

import { useState } from "react";
import { Star, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { restaurantConfig } from "@/restaurant.config";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function FeedbackPage() {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleRating = (value: number) => {
        setRating(value);
    };

    const handleSubmit = async () => {
        if (!comment) return;
        setIsSubmitting(true);

        try {
            await supabase.from('reviews').insert({
                rating,
                message: comment,
            });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting review:", error);
            // Even if it fails, show success for UX in this demo if desired, 
            // but let's stick to simple logic.
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Condition A: High Rating (4 or 5)
    if (rating >= 4) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[var(--radius)] shadow-xl max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={cn("w-8 h-8 fill-current", star <= rating ? "text-yellow-400" : "text-gray-200")} />
                        ))}
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('feedback_high_rating')}</h1>

                    <a
                        href={restaurantConfig.contact.googleMapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#4285F4] text-white font-semibold rounded-[var(--radius)] hover:bg-[#3367D6] transition-colors shadow-md"
                    >
                        <MapPin size={20} />
                        {t('feedback_google_btn')}
                    </a>

                    <Link href="/" className="block text-sm text-gray-500 hover:underline mt-4">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Condition B: Low Rating (1-3) & Submitted
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[var(--radius)] shadow-xl max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-xl font-bold text-[var(--foreground)]">{t('feedback_thank_you_manager')}</h1>
                    <Link href="/" className="block text-sm text-gray-500 hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Default: Selection or Low Rating Form
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[var(--radius)] shadow-xl max-w-md w-full text-center space-y-8">
                <h1 className="text-3xl font-bold text-[var(--foreground)]">{t('feedback_title')}</h1>

                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRating(star)}
                            className="focus:outline-none hover:scale-110 transition-transform"
                        >
                            <Star
                                className={cn(
                                    "w-10 h-10 transition-colors",
                                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 hover:text-yellow-200"
                                )}
                            />
                        </button>
                    ))}
                </div>

                {rating > 0 && rating <= 3 && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
                        <p className="text-gray-600 font-medium">{t('feedback_low_rating')}</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('feedback_placeholder')}
                            className="w-full p-4 border rounded-[var(--radius)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none min-h-[120px]"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!comment || isSubmitting}
                            className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius)] disabled:opacity-50 hover:opacity-90 transition-all"
                        >
                            {isSubmitting ? "..." : t('feedback_submit_btn')}
                        </button>
                    </div>
                )}

                <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600 mt-8">
                    Skip
                </Link>
            </div>
        </div>
    );
}
