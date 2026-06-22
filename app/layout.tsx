import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eraball.com"),
  title: "Era Ball - Basketball Sim Across Eras",
  description: "Draft an all-time NBA roster across every era, pick a coach, and simulate a full season and playoffs. Build your dream team and see how it stacks up in EraBall.",
  keywords: ["EraBall", "NBA", "fantasy draft", "basketball simulation", "NBA draft game", "all-time team builder", "NBA eras"],
  alternates: { canonical: "/" },
  verification: { google: "BsOiE5n6nmDA3hAIMWgiSVAfO563R92K3EdMZF93R6w" },
  openGraph: {
    title: "Era Ball - Basketball Sim Across Eras",
    description: "Draft an all-time NBA roster across every era, pick a coach, and simulate a full season and playoffs.",
    url: "https://eraball.com",
    siteName: "EraBall",
    type: "website",
    images: [{ url: "/era-banners/20s.webp", alt: "EraBall" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Era Ball - Basketball Sim Across Eras",
    description: "Draft an all-time NBA roster across every era and simulate a full season.",
    images: ["/era-banners/20s.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable} h-full`}>
      <head>
        {/* Start fetching player data immediately on HTML parse, before JS loads */}
        <link rel="preload" href="/players_with_stats.json" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full bg-black text-white antialiased" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        {children}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "8bee7d5f26ca468c88a4f87742257a16"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
