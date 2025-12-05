// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// FULL SEO + ICON + SOCIAL PREVIEW CONFIG
export const metadata: Metadata = {
  title: {
    default: "WriteMaster — Master Writing in the Age of AI",
    template: "%s | WriteMaster",
  },

  description:
    "WriteMaster helps writers sharpen creativity, leverage AI responsibly, and build profitable writing careers.",

  keywords: [
    "AI writing",
    "writing jobs",
    "creative writing",
    "content writing",
    "WriteMaster",
  ],

  authors: [{ name: "Carmen Oskie" }],
  creator: "WriteMaster",
  publisher: "WriteMaster",

  // FAVICONS + TOUCH ICONS
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  // OPEN GRAPH (Facebook, WhatsApp, LinkedIn, Discord)
  openGraph: {
    title: "WriteMaster — Master Writing in the Age of AI",
    description:
      "Sharpen creativity, improve your writing skills, and build a high-income writing career with AI-powered tools.",
    url: "https://masterwriters.org",
    siteName: "WriteMaster",
    images: [
      {
        url: "/neie.png", // <-- your OG image in /public (must be 1200x630)
        width: 1200,
        height: 630,
        alt: "WriteMaster — Premium Writing and AI Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // TWITTER / X
  twitter: {
    card: "summary_large_image",
    title: "WriteMaster — Master Writing in the Age of AI",
    description:
      "Sharpen creativity and use AI to boost your writing success.",
    images: ["/neie.png"],
    creator: "@yourhandle",
  },

  // ROBOTS / SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // PWA MANIFEST
  manifest: "/site.webmanifest",
};

// ROOT LAYOUT
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

