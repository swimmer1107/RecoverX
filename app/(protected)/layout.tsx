"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../lib/auth";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
    } else if (user.role !== "patient") {
      router.push("/doctor/dashboard");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="text-xl font-display text-[var(--text-2)]">Checking authorization...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main Content Area - pushed right by sidebar on desktop */}
      <div className="md:ml-[64px] lg:ml-[260px] flex flex-col min-h-screen">
        <Topbar />

        {/* Main scrollable content */}
        <main className="flex-1 p-6 md:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
