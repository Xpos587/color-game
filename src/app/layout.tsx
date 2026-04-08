import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { css } from "styled-system/css";
import "./globals.css";

const suisse = localFont({
  src: "../../public/fonts/SuisseIntlSAlt-Medium.woff2",
  weight: "500",
  variable: "--font-suisse",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Color Game — How Well Can You Remember Colors?",
  description:
    "We show you colors. You recreate them from memory. Challenge friends to beat your score. It's harder than you think. Play free.",
  openGraph: {
    title: "Color Game — How Well Can You Remember Colors?",
    description:
      "We show you colors. You recreate them from memory. Challenge friends to beat your score. It's harder than you think. Play free.",
    images: ["/images/og-default.png"],
    type: "website",
    siteName: "Dialed",
    url: "https://dialed.gg",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Game — How Well Can You Remember Colors?",
    description:
      "We show you colors. You recreate them from memory. Challenge friends to beat your score. It's harder than you think.",
    images: ["/images/og-default.png"],
  },
  icons: {
    icon: "/seo/favicon.svg",
    apple: "/images/og-image.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${suisse.variable} ${inter.variable} ${css({ height: "full" })}`}
    >
      <body className={css({
        height: "full",
        overflow: "hidden",
        background: "black",
        fontFamily: "var(--font-suisse), var(--font-inter), -apple-system, system-ui, sans-serif",
        fontWeight: "500",
        fontSmoothing: "antialiased",
        userSelect: "none",
        WebkitUserSelect: "none" as const,
      })}>
        {/* SVG motion blur filters for shake/earthquake animations */}
        <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          <filter id="mblur-1"><feGaussianBlur in="SourceGraphic" stdDeviation="1.2 0" /></filter>
          <filter id="mblur-2"><feGaussianBlur in="SourceGraphic" stdDeviation="0.6 0" /></filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
