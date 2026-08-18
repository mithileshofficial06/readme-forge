import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Archivo carries the heavy grotesque weight the brutalist headings need;
// JetBrains Mono handles everything else, including body copy.
const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "README Forge",
  description:
    "Generate a ready-to-paste GitHub profile README from any username.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full">
        <div className="texture" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
