import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "KelanaAI - AI Trip Planner",
  description: "Generate personalized travel itineraries powered by AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <footer className="mt-auto relative z-10 border-t border-white/[0.06] py-5 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/35 text-sm">
              &copy; 2026 KelanaAI. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}