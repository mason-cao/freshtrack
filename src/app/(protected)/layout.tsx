import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Authenticated pages must never be emitted as shared static output.
  await connection();
  return <AppShell>{children}</AppShell>;
}
