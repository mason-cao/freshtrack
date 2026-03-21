import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreshTrack - Reduce Food Waste",
  description: "Track your pantry, reduce food waste, and save money with smart expiration tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
