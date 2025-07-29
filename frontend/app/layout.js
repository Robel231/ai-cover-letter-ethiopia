import "./globals.css";

// REMOVED: The font import (e.g., import { Inter } from "next/font/google";)
// REMOVED: The font instantiation (e.g., const inter = Inter(...);)

export const metadata = {
  title: "AI Cover Letter Generator", // Let's give it a better title while we're here
  description: "Generate cover letters instantly for Ethiopian jobs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* REMOVED: className={inter.className} from the body tag */}
      <body>
        {children}
      </body>
    </html>
  );
}