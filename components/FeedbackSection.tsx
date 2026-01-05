"use client";

import { useState } from "react";
import { Star, MapPin, Send, MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { restaurantConfig } from "@/restaurant.config";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function FeedbackSection() {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [customerName, setCustomerName] = useState("");
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
                comment,
                customer_name: customerName,
            });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting review:", error);
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-gray-900 text-white py-16 px-4">
            <div className="max-w-2xl mx-auto text-center space-y-8">
                <div className="flex justify-center">
                    <div className="p-3 bg-white/10 rounded-full">
                        <MessageSquare className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold">{t('feedback_title')}</h2>

                {/* Condition A: High Rating (4-5) */}
                {rating >= 4 ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300 bg-white/5 p-8 rounded-[var(--radius)] border border-white/10">
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={cn("w-8 h-8 fill-current", star <= rating ? "text-yellow-400" : "text-gray-600")} />
                            ))}
                        </div>
                        <h3 className="text-xl font-semibold">{t('feedback_high_rating')}</h3>
                        <a
                            href={restaurantConfig.contact.googleMapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4285F4] text-white font-semibold rounded-[var(--radius)] hover:bg-[#3367D6] transition-colors shadow-lg"
                        >
                            <MapPin size={20} />
                            {t('feedback_google_btn')}
                        </a>
                    </div>
                ) : isSubmitted ? (
                    /* Condition B: Submitted Low Rating */
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300 bg-white/5 p-8 rounded-[var(--radius)] border border-white/10">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                            <Send className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold">{t('feedback_thank_you_manager')}</h3>
                    </div>
                ) : (
                    /* Default: Select Rating or Form */
                    <div className="space-y-8">
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
                                            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600 hover:text-yellow-200"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>

                        {rating > 0 && rating <= 3 && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-md mx-auto text-left">
                                <p className="text-gray-300 font-medium text-center">{t('feedback_low_rating')}</p>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1 ml-1">{t('feedback_name_label')}</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder={t('feedback_name_placeholder')}
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-[var(--radius)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none text-white placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={t('feedback_placeholder')}
                                        className="w-full p-4 bg-gray-800 border border-gray-700 rounded-[var(--radius)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none min-h-[120px] text-white placeholder-gray-500"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!comment || isSubmitting}
                                    className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius)] disabled:opacity-50 hover:opacity-90 transition-all"
                                >
                                    {isSubmitting ? "..." : t('feedback_submit_btn')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
