import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { AuthStatus, AuthStatusFallback } from "@/components/AuthStatus";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { PlayerBar } from "@/components/player/PlayerBar";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { site } from "@/lib/site";

// Self-hosted variable font: no runtime request to Google, no layout shift.
const montserrat = localFont({
  src: "./fonts/Montserrat-Variable.woff2",
  variable: "--font-montserrat",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Learn music online`, template: `%s | ${site.shortName}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  /** Parallel route slot (src/app/@modal) used for the course preview modal. */
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${montserrat.variable}`}>
      <body className="antialiased font-montserrat bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <PlayerProvider>
          <Navbar
            authSlot={
              <Suspense fallback={<AuthStatusFallback />}>
                <AuthStatus />
              </Suspense>
            }
          />
          <div id="main">{children}</div>
          {modal}
          <Footer />
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
