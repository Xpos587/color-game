import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
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
    "Мы показываем цвета. Ты воссоздаёшь их по памяти. Брось вызов друзьям — пусть попытаются побить твой счёт. Это сложнее, чем кажется. Играй бесплатно.",
  openGraph: {
    title: "Color Game — How Well Can You Remember Colors?",
    description:
      "Мы показываем цвета. Ты воссоздаёшь их по памяти. Брось вызов друзьям — пусть попытаются побить твой счёт. Это сложнее, чем кажется. Играй бесплатно.",
    images: ["/images/og-default.png"],
    type: "website",
    siteName: "Dialed",
    url: "https://dialed.gg",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Game — How Well Can You Remember Colors?",
    description:
      "Мы показываем цвета. Ты воссоздаёшь их по памяти. Брось вызов друзьям — пусть попытаются побить твой счёт. Это сложнее, чем кажется.",
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
      lang="ru"
      className={`${suisse.variable} ${inter.variable} h-full`}
    >
      <body className="h-full overflow-hidden bg-black font-[family-name:var(--font-suisse),var(--font-inter),-apple-system,system-ui,sans-serif] font-medium antialiased select-none [-webkit-user-select:none]">
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
