import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { PrototypeBanner } from "@/components/layout/PrototypeBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GlobalNewsletterSection } from "@/components/newsletter/GlobalNewsletterSection";
import { SearchPaletteProvider } from "@/components/search/SearchPaletteProvider";
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
    default: "Reltroner — Systemic Creative Architect",
    template: "%s · Reltroner Learning Academy",
  },
  description:
    "Turn an idea into a world of possibilities. Explore how fictional conditions shape choices, consequences, and the next creative question.",
  metadataBase: new URL("https://lms.reltroner.com"),
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#071226" },
  ],
  width: "device-width",
  initialScale: 1,
};

// One shell for every route: header, page content, then a single newsletter immediately above a
// single footer. The search palette and floating assistant are overlays owned here, not per page.
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
        <a href="#main-content"
          className="fixed left-3 top-3 z-[200] -translate-y-24 rounded-lg bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-lg transition focus:translate-y-0">
          Skip to content
        </a>
        <ThemeProvider>
          <SearchPaletteProvider>
            <PrototypeBanner />
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
            <GlobalNewsletterSection />
            <Footer />
            <FloatingChatWidget />
          </SearchPaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
