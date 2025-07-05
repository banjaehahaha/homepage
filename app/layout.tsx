
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: "Jaeha Ban",
  description: "Research-driven performance art, exploring division, technology, and distribution.",
  openGraph: {
    title: "Jaeha Ban",
    description: "여기를 눌러 링크를 확인하세요.",
    url: "https://banjaeha.com",
    siteName: "Jaeha Ban",
    images: [
      {
        url: "https://banjaeha.com/og-image.png", // 실제 이미지 주소로 변경
        width: 1200,
        height: 630,
        alt: "Jaeha Ban",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaeha Ban",
    description: "여기를 눌러 링크를 확인하세요.",
    images: ["https://banjaeha.com/og-image.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
 
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
      <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
