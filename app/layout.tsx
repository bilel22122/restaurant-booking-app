import OneSignalInit from "@/components/OneSignalInit"; // ✅ Import is here
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { restaurantConfig } from "@/restaurant.config";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e11d48",
};

export const metadata: Metadata = {
  title: restaurantConfig.name,
  description: restaurantConfig.content.heroSubtitle,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: restaurantConfig.name,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeVars = {
    "--primary": `hsl(${restaurantConfig.theme.primaryColor})`,
    "--secondary": `hsl(${restaurantConfig.theme.secondaryColor})`,
    "--accent": `hsl(${restaurantConfig.theme.accentColor})`,
    "--radius": restaurantConfig.theme.borderRadius,
    "--background": "white",
    "--foreground": "#171717",
  } as React.CSSProperties;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={themeVars}
      >
        <LanguageProvider>
          <Navbar />
          {children}
          
          <PWAInstallPrompt />
          
          {/* 👇 THIS WAS MISSING! I ADDED IT HERE: */}
          <OneSignalInit />
          
        </LanguageProvider>
      </body>
    </html>
  );
}