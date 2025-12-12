import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import "./fix-overlap.css";
import "./portal-fix.css";
import { Providers } from "./providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import { NextAuthProvider } from "./session-provider";
import { Toaster } from "sonner";

const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Epic.ai - AI Voice Agents Platform",
  description: "Create and manage AI voice agents for real conversations",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <NextAuthProvider>
          <Providers>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </Providers>
        </NextAuthProvider>
        <div id="modal-root"></div>
        <div id="portal-root"></div>
        <Toaster 
          position="top-right" 
          richColors 
          expand 
          closeButton 
          duration={4000}
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
          }}
        />
      </body>
    </html>
  );
}
