import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import TegoHeader from "@/components/common/TegoHeader";
import TegoFooter from "@/components/common/TegoFooter";

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
    "random video chat app",
    "random video call platform",
    "live video chat app",
    "live streaming platform",
    "live streaming app India",
    "HD live streaming platform",
    "HD video call app worldwide",
    "real-time video platform",
    "real-time video communication",
    "one-to-one live video chat",
    "browser-based video calling app",
    "web-based random video chat",
    "no app needed video call platform",

    // Stranger / social discovery
    "random chat with strangers",
    "talk to strangers online live",
    "find stranger to chat",
    "find strangers online",
    "talk to random stranger",
    "video chat with strangers",
    "chat with unknown people",
    "stranger video calling website",
    "stranger video call India",
    "stranger chat website",
    "live stranger video chat platform",
    "global live connection app",
    "global social discovery platform",
    "meet people instantly online",
    "connect with new people online",
    "meet people around the world",
    "live chat with global users",

    // Girl / boy discovery (safe phrasing)
    "find girl for video chat",
    "find boy for video chat",
    "find girls online to talk",
    "find boys online to chat",
    "online video chat with random girls",
    "online video call with random boys",
    "meet new girls on video chat",
    "find new boys to talk instantly",
    "chat with random girls",
    "chat with random boys",
    "meet random girls online",
    "meet random boys online",
    "random girl video call",
    "random boy video call",
    "live chat with girls worldwide",
    "live chat with boys worldwide",

    // Product positioning
    "best live stream platform 2025",
    "best stranger chat website 2025",
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
    "AI-powered random chat",

    // Monetization / creator angle
    "HD live stream for influencers",
    "creator live streaming platform",

    // Competitor alternatives
    "live cam chat alternative to azar",
    "alternative to azar video chat",
    "chatroulette alternative website",
    "omegle alternative 2025",

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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "https://tego.live/tegologo.png",
    shortcut: "https://tego.live/tegologo.png",
    apple: "https://tego.live/tegologo.png",
  },
  metadataBase: new URL("https://tego.live"),
  themeColor: "#050816",
};

// ---- Layout ----
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#111] text-white`}
      >
        <TegoHeader />
        <main className="min-h-screen">{children}</main>
        <TegoFooter />
      </body>
    </html>
  );
}
