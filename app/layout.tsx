import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CreditsProvider } from "@/components/credits/credits-provider";
import { DemoSessionProvider } from "@/components/demo-session-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Haircut",
  description: "See your cut before the first snip.",
  applicationName: "Haircut",
  appleWebApp: {
    capable: true,
    title: "Haircut",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Light theme only for now (dark tokens stay in globals.css, unwired).
  themeColor: "#f8f7f2",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CreditsProvider>
          <DemoSessionProvider>{children}</DemoSessionProvider>
        </CreditsProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
