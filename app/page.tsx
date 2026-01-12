"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import BookingFlow from "@/components/BookingFlow";
import FeedbackSection from "@/components/FeedbackSection";

import { restaurantConfig } from "@/restaurant.config";
import { UtensilsCrossed, ArrowRight } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gray-900 flex items-center justify-center text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60 scale-105"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80")' }}
        />



        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[var(--primary)] rounded-full bg-opacity-90">
              <UtensilsCrossed size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            {restaurantConfig.name}
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-100 max-w-2xl mx-auto">
            {restaurantConfig.content.heroSubtitle}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-4xl font-bold text-[var(--foreground)]">{t('hero_title')}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('hero_subtitle')}
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-white text-lg font-semibold rounded-[var(--radius)] hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg"
          >
            <UtensilsCrossed size={20} />
            {t('hero_cta')}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Booking Section */}
      <section className="flex-1 bg-gray-50 py-16 px-4 -mt-20 relative z-30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: About Text */}
          <div className="space-y-8 pt-8">
            <div>
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {restaurantConfig.content.aboutText}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-[var(--radius)] shadow-sm border border-gray-100">
                <h3 className="font-semibold text-[var(--primary)] mb-2">Open Daily</h3>
                <p className="text-gray-600 text-sm">Mon-Sun: 12:00 PM - 10:00 PM</p>
              </div>
              <div className="p-6 bg-white rounded-[var(--radius)] shadow-sm border border-gray-100">
                <h3 className="font-semibold text-[var(--primary)] mb-2">Location</h3>
                <p className="text-gray-600 text-sm">{restaurantConfig.contact.address}</p>
              </div>
            </div>
          </div>

          {/* Right: Booking App */}
          <div>
            <BookingFlow />
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <FeedbackSection />

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} {restaurantConfig.name}. All rights reserved.</p>
        <p className="mt-2">{restaurantConfig.contact.address} • {restaurantConfig.contact.phone}</p>
      </footer>
    </main>
  );
}
