import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watchtower - API Uptime Monitoring",
  description: "Monitor your APIs and services with Watchtower",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a
              href="/"
              className="text-xl font-bold text-gray-900 flex items-center gap-2"
            >
              <span className="text-2xl">🗼</span> Watchtower
            </a>
            <div className="flex gap-6">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </a>
              <a
                href="/monitors/create"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Add Monitor
              </a>
              <a
                href="/status"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Status Page
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
