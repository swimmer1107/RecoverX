"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../lib/auth";
import DoctorSidebar from "./components/DoctorSidebar";
import DoctorTopbar from "./components/DoctorTopbar";

export default function DoctorLayout({
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
    } else if (user.role !== "doctor") {
      router.push("/dashboard");
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
      <DoctorSidebar />
      <div className="md:ml-[64px] lg:ml-[260px] flex flex-col min-h-screen">
        <DoctorTopbar />
        <main className="flex-1 p-6 md:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
