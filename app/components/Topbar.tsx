"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import { getUser, getInitials } from "../lib/auth";

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/dashboard"))     return "Dashboard";
  if (pathname.includes("/session"))       return "Live Session";
  if (pathname.includes("/activity"))      return "Activity & Progress";
  if (pathname.includes("/reports"))       return "Medical Reports";
  if (pathname.includes("/checkin"))       return "Daily Check-in";
  if (pathname.includes("/faq"))           return "AI Coach FAQ";
  if (pathname.includes("/find-doctors"))  return "Find Doctors";
  if (pathname.includes("/emergency"))     return "Emergency";
  if (pathname.includes("/profile"))       return "Patient Profile";
  if (pathname.includes("/settings"))      return "Settings";
  return "AntiGravity";
};

export default function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const [initials, setInitials] = useState("AS");

  useEffect(() => {
    const user = getUser();
    if (user?.name) {
      setInitials(getInitials(user.name));
    }
  }, []);

  return (
    <header
      className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 md:px-8"
      style={{
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 8px rgba(0,40,80,0.06)",
      }}
    >
      {/* Page Title */}
      <h1 className="font-display font-semibold text-[22px] text-[var(--text-1)]">
        {title}
      </h1>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/emergency"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--danger)", color: "#fff",
            border: "none", borderRadius: "var(--r-full)",
            padding: "7px 16px", fontSize: 13, fontWeight: 700,
            textDecoration: "none", boxShadow: "0 2px 10px rgba(217,64,64,0.30)",
            transition: "all 0.18s",
            fontFamily: "var(--font-display)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#B02020";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--danger)";
            e.currentTarget.style.transform = "";
          }}
        >
          🚨 Emergency
        </Link>

        <NotificationBell />

        {/* Mobile Avatar */}
        <div
          className="md:hidden w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-white text-xs cursor-pointer"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            boxShadow: "var(--shadow-blue)",
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
