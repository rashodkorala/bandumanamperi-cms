import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Personal CMS",
  description: "A personal content management system for managing projects and photography",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Personal CMS",
    description: "A personal content management system",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Personal CMS",
    description: "A personal content management system",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${geistSans.className} antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="theme-preference"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
