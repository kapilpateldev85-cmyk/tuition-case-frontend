import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TuitionSpace",
    template: "%s | TuitionSpace",
  },
  description:
    "TuitionSpace — the tuition marketplace connecting parents with qualified tutors in Singapore.",
  keywords: ["tuition", "tutors", "singapore", "education", "marketplace"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased font-[var(--font-inter),ui-sans-serif,system-ui,sans-serif]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
