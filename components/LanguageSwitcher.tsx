
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
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                        language === lang.code
                            ? "bg-white text-orange-600 font-bold shadow-sm ring-1 ring-black/5"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                    )}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
