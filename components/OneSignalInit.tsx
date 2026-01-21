"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { usePathname } from "next/navigation"; // <--- 1. Import this

export default function OneSignalInit() {
  const pathname = usePathname(); // <--- 2. Get current URL

  useEffect(() => {
    // 3. Define Admin Zones (Must match your PWA logic)
    const isAdminPage = 
      pathname?.includes("/portal-v2-auth") || 
      pathname?.includes("/dashboard") || 
      pathname?.includes("/admin");

    // 4. If NOT admin, stop here. Do not init. Do not prompt.
    if (!isAdminPage) return;

    if (typeof window !== "undefined") {
      try {
        OneSignal.init({
          appId: "be01a0d6-cbe2-4420-a504-9b0fc66eb38a",
          allowLocalhostAsSecureOrigin: true,
        } as any).then(() => {
            console.log("OneSignal Initialized (Admin Mode)");
            
            // This prompt will ONLY appear for Admins now
            OneSignal.Slidedown.promptPush(); 
        });
      } catch (error) {
        console.log("OneSignal init error:", error);
      }
    }
  }, [pathname]); // <--- Re-run check if page changes

  return null;
}