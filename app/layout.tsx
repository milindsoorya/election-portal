import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsTicker from "@/components/NewsTicker";

export const metadata: Metadata = {
  title: "India Election Portal — Kerala 2026",
  description:
    "Your complete guide to the Kerala 2026 Assembly Elections. Candidate profiles, polling booth finder, live results, voter guide, and civic trivia.",
  keywords: "Kerala election 2026, candidates, polling booth, live results, voter guide, LDF, UDF, NDA",
  openGraph: {
    title: "India Election Portal — Kerala 2026",
    description: "Complete election information for Kerala voters — candidates, booths, results, and civic education.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <NewsTicker />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
