import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Impersed Cubiertas FC | Pagina Oficial",
  description:
    "Pagina oficial de Impersed Cubiertas FC. Conoce a nuestro equipo, proximos partidos, estadisticas y mas.",
};

export const viewport: Viewport = {
  themeColor: "#022B1F",
  width: "device-width",
  initialScale: 1,
};

import { TeamProvider } from "@/components/providers/team-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">
        <TeamProvider>
          {children}
        </TeamProvider>
      </body>
    </html>
  );
}
