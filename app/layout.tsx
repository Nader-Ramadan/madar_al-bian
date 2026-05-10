import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/nav-bar";
import Footer from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home",
  description: "Madar Al Bian",
  icons: {
    icon: "/images/logo/icon-logo/svg-main-Icon-transparent.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NavBar />
        <main dir="auto" className="site-main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
