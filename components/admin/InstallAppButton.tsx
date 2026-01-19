"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

export default function InstallAppButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        // Check for iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (isStandalone) return null; // Already installed

    if (isIOS) {
        return (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-6 flex items-start gap-3">
                <Share size={20} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold">Install Admin App</p>
                    <p className="opacity-90">Tap <span className="font-bold">Share</span> → <span className="font-bold">Add to Home Screen</span> to install.</p>
                </div>
            </div>
        );
    }

    if (!deferredPrompt) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="w-full mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
        >
            <Download size={20} />
            Install Admin App
        </button>
    );
}
