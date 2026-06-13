import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeLanguageProvider } from "@/components/providers/ThemeLanguageProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Personal Homepage",
  description: "AI-assisted personal homepage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        <ThemeLanguageProvider>{children}</ThemeLanguageProvider>
      </body>
    </html>
  );
}
