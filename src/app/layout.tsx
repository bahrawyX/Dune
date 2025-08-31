import type { Metadata } from "next";
import { Montserrat, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ClerkProvider from "@/services/clerk/components/clerkProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lami Inc.",
  description: "Your Way To Your Dream Job or Dream Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider> 
      <html lang="en">

        <body
          className={`${montserrat.variable} ${spaceGrotesk.variable} antialiased dark`}
          >
          {children}
        </body>
      </html>
      </ClerkProvider>
  );
}
