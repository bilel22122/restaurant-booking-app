import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { restaurantConfig } from "@/restaurant.config";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: restaurantConfig.name,
  description: restaurantConfig.content.heroSubtitle,
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
        </LanguageProvider>
      </body>
    </html>
  );
}
