import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Component Comparison",
  description: "Compare UI components across brands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50 text-gray-900 min-h-screen`}>
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight hover:text-blue-600 transition-colors">
            Component Comparison
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">Components</Link>
            <Link href="/pages" className="text-gray-500 hover:text-blue-600 transition-colors">Pages</Link>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
