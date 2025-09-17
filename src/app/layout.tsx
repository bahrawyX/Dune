import type { Metadata } from "next";
import { Montserrat, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@mdxeditor/editor/style.css";
import ClerkProvider from "@/services/clerk/components/clerkProvider";
import { Toaster } from "@/components/ui/sonner";
import { extractRouterConfig } from "uploadthing/server";
import { customFileRouter } from "@/services/uploadthing/router";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import SiteFooter from "@/components/navigation/SiteFooter";
import TopOvalNavbar from "@/components/navigation/TopOvalNavbar";
import { Briefcase, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  title: "Dune Inc.",
  description: "Your Way To Your Dream Job or Dream Team",
  icons: {
    icon: "/favicons/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${spaceGrotesk.variable} antialiased `}
      >
        <NextSSRPlugin 
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(customFileRouter)}
        />
        <ClerkProvider>


          {children}
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
