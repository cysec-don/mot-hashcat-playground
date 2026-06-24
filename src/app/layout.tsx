import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOT Hashcat Playground — Master Password Recovery & Hashcat",
  description:
    "MOT Hashcat Playground — an elite cybersecurity training platform for mastering Hashcat, password recovery, MD5/SHA1/SHA2-256 cracking, and simulated wallet.dat analysis. 20 guided labs, interactive cyber range, professional certification.",
  keywords: [
    "Hashcat",
    "Password Cracking",
    "Cybersecurity Training",
    "MD5",
    "SHA1",
    "SHA256",
    "Wallet Recovery",
    "Cyber Range",
    "Certification",
  ],
  authors: [{ name: "MOT Hashcat Playground" }],
  openGraph: {
    title: "MOT Hashcat Playground",
    description:
      "Master Password Recovery. Master Hashcat. Master the Art of Cracking.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
        <SonnerToaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              border: "1px solid rgba(0,229,255,0.3)",
              color: "#F5F7FA",
            },
          }}
        />
      </body>
    </html>
  );
}
