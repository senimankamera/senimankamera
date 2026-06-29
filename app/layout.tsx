import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModalProvider } from "@/components/modal-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seniman Kamera | PHOTOSHOOT",
  description: "Immersive, editorial-style wedding, prewedding, and event photography in Indonesia.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ModalProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
