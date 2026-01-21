"use client";

import { useState, useEffect } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation"; // <--- 1. Import the URL hook

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    
    const pathname = usePathname(); // <--- 2. Get the current page URL

    // 3. Define your "Admin Only" zones
    // The button will ONLY show if the URL contains one of these words
    const isAdminPage = pathname?.includes("/portal-v2-auth") || 
                        pathname?.includes("/dashboard") || 
                        pathname?.includes("/admin");

    useEffect(() => {
        // Check if running in standalone mode
        const isInStandaloneMode = () =>
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes("android-app://");

        setIsStandalone(isInStandaloneMode());

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Handle Android/Desktop beforeinstallprompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        } else if (isIOS) {
            setShowIOSModal(true);
        }
    };

    // ---------------------------------------------------------
    // 👇 SECURITY CHECK: HIDE IF NOT ADMIN PAGE
    // ---------------------------------------------------------
    if (!isAdminPage) return null; 
    // ---------------------------------------------------------

    if (isStandalone) return null; // Don't show if already installed
    
    // Logic: If iOS, show it (because iOS doesn't fire an event). 
    // If Android, wait for the event.
    if (!deferredPrompt && !isIOS) return null; 

    return (
        <>
            {/* Floating Install Button */}
            <motion.button
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:bg-rose-700 active:scale-95 sm:bottom-6 sm:left-6"
                onClick={handleInstallClick}
            >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">Install App</span>
                <span className="inline sm:hidden">Install</span>
            </motion.button>

            {/* iOS Instructions Modal */}
            <AnimatePresence>
                {showIOSModal && (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 px-4 pb-6 pt-4 sm:items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
                        >
                            <button
                                onClick={() => setShowIOSModal(false)}
                                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="mb-4 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                                    <Download className="h-6 w-6 text-rose-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Install App
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Install this app on your home screen for quick and easy access.
                                </p>
                            </div>

                            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                                <div className="flex items-center gap-3">
                                    <Share className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm text-gray-700">
                                        1. Tap the <span className="font-semibold">Share</span>{" "}
                                        button in the toolbar.
                                    </span>
                                </div>
                                <div className="h-px bg-gray-200" />
                                <div className="flex items-center gap-3">
                                    <Plus className="h-5 w-5 text-gray-900" />
                                    <span className="text-sm text-gray-700">
                                        2. Select <span className="font-semibold">Add to Home Screen</span>.
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowIOSModal(false)}
                                className="mt-6 w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}