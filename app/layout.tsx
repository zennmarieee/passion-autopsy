import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Passion Autopsy",
  description: "A compassionate case file for the passions we've let go.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-ink min-h-screen">{children}</body>
    </html>
  );
}
