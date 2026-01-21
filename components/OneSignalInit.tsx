"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalInit() {
  useEffect(() => {
    // We only run this on the client side (browser)
    if (typeof window !== "undefined") {
      try {
        OneSignal.init({
          appId: "be01a0d6-cbe2-4420-a504-9b0fc66eb38a", // Your Real ID
          // We removed the notifyButton block to fix the error.
          // You can configure the Bell Icon style in your OneSignal Dashboard settings.
          allowLocalhostAsSecureOrigin: true,
        } as any).then(() => { // <--- 'as any' fixes the type error
            console.log("OneSignal Initialized");
        });
      } catch (error) {
        console.log("OneSignal init error:", error);
      }
    }
  }, []);

  return null; 
}