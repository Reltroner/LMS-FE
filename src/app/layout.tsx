import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { PrototypeBanner } from "@/components/layout/PrototypeBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingChatWidget } from "@/components/assistant/FloatingChatWidget";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Reltroner Learning Academy",
    template: "%s · Reltroner Learning Academy",
  },
  description:
    "Engineering skills, AI skills, and project-based learning for long-term capability.",
  metadataBase: new URL("https://lms.reltroner.com"),
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07111f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <PrototypeBanner />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
