import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  title: "Tego.live – Connect, Stream & Chat Globally in Real Time",
  description:
    "Tego.live is a global live streaming and random video chat platform. Meet new people, go live, or join trending streams instantly with HD quality and real-time interactions.",
  keywords: [
    "Tego.live",
    "live video chat app",
    "random video call platform",
    "live streaming app India",
    "AI-powered live stream",
    "random chat with strangers",
    "global live connection app",
    "Next.js live streaming platform",
    "HD video call app worldwide",
    "live talk and meet app",
    "voice and video chat with strangers",
    "real-time video platform",
    "local live streaming app India",
    "best live stream platform 2025",
    "random video chat Next.js app",
    "Agora-based live chat app",
    "worldwide live connect network",
    "meet people instantly online",
    "Tego.live real-time connection",
    "Tego global streaming platform",
  ],
  authors: [{ name: "Navneet Singh", url: "https://tego.live" }],
  openGraph: {
    title: "Tego.live – Global Random Video Chat & Live Streaming Platform",
    description:
      "Experience real-time live streaming and random video calls with users across the globe. Tego.live connects you instantly with people worldwide.",
    url: "https://tego.live",
    siteName: "Tego.live",
    images: [
      {
        url: "https://tego.live/og-image.jpg",
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
    images: ["https://tego.live/og-image.jpg"],
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
  metadataBase: new URL("https://tego.live"),
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
