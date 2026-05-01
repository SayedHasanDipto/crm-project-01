import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700"]
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"]
});

export const metadata: Metadata = {
  title: "Pipeline CRM",
  description: "Simple lead tracking CRM"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <body className={`${syne.variable} ${dmMono.variable} font-sans bg-base-100 text-base-content`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
