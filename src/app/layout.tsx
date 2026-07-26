import type { Metadata } from "next";
import { Oswald, Space_Grotesk, Space_Mono } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import "./globals.css";

const displayFont = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const monoFont = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Collectr Stream - Pokémon TCG Portfolio Tracker",
  description: "A Verge-styled brutalist portfolio tracker and explorer for Pokémon TCG cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-background text-foreground transition-colors duration-200">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
