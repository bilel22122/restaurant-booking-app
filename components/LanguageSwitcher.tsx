"use client";

import { useLanguage } from './LanguageProvider';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'fr', label: 'Français' },
        { code: 'ar', label: 'العربية' },
    ] as const;

    return (
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium transition-all duration-200",
                        language === lang.code
                            ? "bg-white text-black shadow-sm"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
