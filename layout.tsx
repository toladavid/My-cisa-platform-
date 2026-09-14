import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--ff-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--ff-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--ff-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PILOT — Intelligent CISA Exam Preparation",
  description:
    "Adaptive CISA prep engine: upload your study materials, extract key points, generate questions, and follow a spaced-repetition study plan built for your exam date.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <div className="app-backdrop" />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
