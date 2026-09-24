import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthModal } from "@/components/AuthModal";
import "./globals.css";

const interFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFont = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "MCARD | Pokémon TCG Market Telemetry & Vault",
  description: "Real-time market telemetry, luxury card archive, and high-performance portfolio tracking for Pokémon TCG cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interFont.variable} ${monoFont.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-ferrari-red selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <AuthModal />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
