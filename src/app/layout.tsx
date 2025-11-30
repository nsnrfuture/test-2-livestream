import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationInit from "@/components/NotificationInit";
import PushSubscriber from "@/components//PushSubscriber";



import TegoHeader from "@/components/common/TegoHeader";
import TegoFooter from "@/components/common/TegoFooter";
import Script from "next/script";

// ---- Fonts ----
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ---- Global SEO Metadata ----
export const metadata: Metadata = {
  // Better title setup (page-specific titles will use this template)
  title: {
    default: "Tego.live – Random Video Chat & Live Streaming App",
    template: "%s | Tego.live",
  },
  applicationName: "Tego.live",
  description:
    "Tego.live is a global random video chat and live streaming platform. Meet new people, find girls, boys and strangers to talk with, go live, or join trending streams instantly with HD quality and real-time interactions.",
  category: "social networking",
  keywords: [
    // Brand + core
    "Tego.live",
    "Tego live",
    "Tego live video chat",
    "tego live streaming app",
    "Tego global streaming platform",
    "Tego.live real-time connection",

    // Main use-cases
    "live video chat app",
    "live streaming platform",
    "live streaming app India",
    "HD live streaming platform",
    "HD video call app worldwide",
    "real-time video platform",
    "real-time video communication",
    "one-to-one live video chat",
    "browser-based video calling app",
    "web-based  video chat",
    "no app needed video call platform",

    // Product positioning
    "best live stream platform 2025",
    "best live stream platform 2026",
    "best stranger chat website 2025",
    "best stranger chat website 2026",
    "best Indian video chat app",
    "best live video calling site",
    "best live connection site",
    "online video call with new people",
    "instant video match platform",
    "match and chat instantly",
    "match people online live",
    "live dating and matching app",
    "live talk and meet app",
    "live talk platform worldwide",

    // Tech stack / niche
    "Next.js live streaming platform",
    "Agora-based live chat app",
    "Agora video call app",
    "AI-powered live stream",
    "AI-based live streaming app",
    "AI-powered video chat",

    // Monetization / creator angle
    "HD live stream for influencers",
    "creator live streaming platform",

    // Competitor alternatives
    "live cam chat alternative to azar",
    "alternative to azar video chat",
    "chatroulette alternative website",
    "omegle alternative 2025",
    "omegle alternative 2026",

    // Safety / frictionless entry
    "free video chat without login",
    "anonymous random chat video",
    "secure random video chat app",
  ],
  authors: [{ name: "Navneet Singh", url: "https://tego.live" }],
  creator: "Navneet Singh",
  publisher: "Tego.live",
  openGraph: {
    title: "Tego.live – Global Random Video Chat & Live Streaming Platform",
    description:
      "Experience real-time live streaming and random video calls with users across the globe. Tego.live connects you instantly with people worldwide.",
    url: "https://tego.live",
    siteName: "Tego.live",
    images: [
      {
        url: "https://tego.live/tegologo.png",
        width: 1200,
        height: 630,
        alt: "Tego.live App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tego.live – Global Live Streaming & Random Video Chat",
    description:
      "Connect, stream, and chat instantly on Tego.live – your gateway to the world of live video and social discovery.",
    images: ["https://tego.live/tegologo.png"],
  },
  alternates: {
    canonical: "https://tego.live",
  },
};


// ---- Layout ----
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Google tag (gtag.js) */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-17765380641"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17765380641');
        `}
      </Script>
      

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#111] text-white`}
      >
        <NotificationInit />
        <PushSubscriber userId={null} />
        <TegoHeader />
        <main className="min-h-screen">{children}</main>
        <TegoFooter />
      </body>
    </html>
  );
}
