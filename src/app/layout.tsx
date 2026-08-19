import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { SilkBackground } from "./silk-background";
import "./globals.css";

// Three-way split: Bricolage Grotesque for display, Geist for everything the
// user reads, Geist Mono for anything machine-shaped (labels, code, preview).
//
// Bricolage is loaded as the variable font with its optical-size axis pulled in
// (next/font ships wght only by default) so the masthead can run at opsz 96 —
// the display cut, with tighter apertures and finer joins than the text cut.
// Weights come off the wght axis, so no static `weight` list here.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
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
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full">
        <SilkBackground />
        <div className="texture" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
