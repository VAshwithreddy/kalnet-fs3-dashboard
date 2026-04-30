import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "../styles/tokens.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Kalnet FS3 Dashboard",
  description: "Enterprise-ready full-stack dashboard starter for Kalnet FS3.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[var(--page-bg)] text-[var(--ink-strong)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
