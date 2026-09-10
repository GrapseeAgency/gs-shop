import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SWRegister } from "@/components/sw-register";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grapsee Shop  Websites, Apps & DevOps Solutions",
  description:
    "Digital services by Grapsee agency. Buy websites, mobile apps, and DevOps solutions built by the Grapsee team.",
  keywords: [
    "Grapsee", "web development", "mobile apps", "DevOps",
    "digital agency", "e-commerce", "captainpiracy",
  ],
  authors: [{ name: "Grapsee Team" }],
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Grapsee Shop",
    description: "Digital services by Grapsee agency",
    siteName: "Grapsee Shop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grapsee Shop",
    description: "Digital services by Grapsee agency",
  },
};

export const viewport: Viewport = {
  themeColor: "#00A86B",   // Jade green our brand
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="light"
      suppressHydrationWarning
    >
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body
        className="antialiased bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        <SWRegister />
        <SessionProvider>
          <I18nProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
