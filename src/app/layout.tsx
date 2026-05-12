import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack-production-290e.up.railway.app";

const defaultTitle = "FreshTrack. Stop throwing out groceries. Save money. Waste less food.";
const defaultDescription =
  "FreshTrack is a free pantry tracker that shows what's about to go bad, suggests recipes to use it up, and tells you how much you've saved. Built for busy households.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "FreshTrack",
  title: {
    default: defaultTitle,
    template: "%s · FreshTrack",
  },
  description: defaultDescription,
  keywords: [
    "pantry tracker",
    "food waste app",
    "reduce food waste",
    "expiration date tracker",
    "kitchen inventory",
    "use it up recipes",
    "grocery tracker",
    "save money on groceries",
  ],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FreshTrack",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "FreshTrack",
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "productivity",
};

export const viewport: Viewport = {
  themeColor: "#527a52",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream font-sans text-stone-900 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
