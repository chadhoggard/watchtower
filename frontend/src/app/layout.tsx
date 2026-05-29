import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watchtower - API Uptime Monitoring",
  description: "Monitor your APIs and services with Watchtower",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
