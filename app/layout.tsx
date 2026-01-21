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

// ---------------------------------------------------------
// 👇 FIX 1: Viewport must be exported SEPARATELY
// ---------------------------------------------------------
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents accidental zooming on buttons
  themeColor: "#e11d48", // Makes the status bar red to match your app
};

export const metadata: Metadata = {
  title: restaurantConfig.name,
  description: restaurantConfig.content.heroSubtitle,
  // ---------------------------------------------------------
  // 👇 PWA CONFIGURATION
  // ---------------------------------------------------------
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Makes the app look more "native" on iPhone
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
          {/* 👇 This is perfect, keep it here */}
          <PWAInstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}