import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coolersimulate.site"),
  title: "Simulasi Pendinginan",
  description: "Fisika Dasar - Sistem Pendinginan CPU/Server dengan model digital interaktif.",
  keywords: [
    "simulasi pendinginan",
    "fisika dasar",
    "CPU cooling",
    "server cooling",
    "simulasi panas",
    "Q=hAΔT",
  ],
  authors: [{ name: "Handika" }],
  openGraph: {
    title: "Simulasi Pendinginan CPU/Server",
    description:
      "Simulasi interaktif sistem pendinginan CPU/Server untuk tugas Fisika Dasar.",
    url: "https://coolersimulate.site",
    siteName: "Simulasi Pendinginan",
    images: [
      {
        url: "/favicon.ico", 
        width: 256,
        height: 256,
        alt: "Simulasi Pendinginan",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Simulasi Pendinginan",
    description:
      "Simulasi digital sistem pendinginan CPU/Server untuk Fisika Dasar.",
    images: ["/favicon.ico"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
