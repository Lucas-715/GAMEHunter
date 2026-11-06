import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import InteractiveBackground from "@/components/InteractiveBackground";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameHunter - Caçador de Ofertas & Keys",
  description: "Rastreie preços em tempo real, compare ofertas e compre jogos digitais com entrega imediata.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-x-hidden">
        <Providers>
          <InteractiveBackground />
          <SplashScreen />
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
