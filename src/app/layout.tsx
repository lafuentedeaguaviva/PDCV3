import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Import Material Symbols via CSS in globals.css or directly here if needed
// For now, using Outfit as the display font
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "EduPlan Pro | Sistema de Gestión PDC",
  description: "Plataforma premium para la planificación curricular de unidades educativas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${outfit.variable} font-display antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
