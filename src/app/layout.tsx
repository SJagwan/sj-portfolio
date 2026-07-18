/* eslint-disable @next/next/next-script-for-ga */
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Layout } from "@/components";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shubhanshu Portfolio",
  description: "SJ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
