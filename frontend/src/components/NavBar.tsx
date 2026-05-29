"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/status") return null;

  function handleLogout() {
    logout();
    router.push("/status");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Image src="/logo.png" alt="Watchtower" width={32} height={32} className="rounded-lg" />
          Watchtower
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
            Dashboard
          </Link>
          <Link href="/monitors/create" className="text-gray-600 hover:text-gray-900 font-medium">
            Add Monitor
          </Link>
          <Link href="/status" className="text-gray-600 hover:text-gray-900 font-medium">
            Status Page
          </Link>
          {user && (
            <>
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
