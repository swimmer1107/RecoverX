"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Stethoscope, Bell } from "lucide-react";
import { getUser, getInitials } from "../../lib/auth";

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/doctor/dashboard"))     return "Clinical Overview";
  if (pathname.includes("/doctor/patients"))      return "My Patients";
  if (pathname.includes("/doctor/prescriptions")) return "Prescriptions & Protocols";
  if (pathname.includes("/doctor/reports"))       return "Reports & Notes";
  if (pathname.includes("/doctor/analytics"))     return "Analytics";
  if (pathname.includes("/doctor/messages"))      return "Messages";
  if (pathname.includes("/doctor/settings"))      return "Settings";
  return "Doctor Portal";
};

export default function DoctorTopbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const [initials, setInitials] = useState("DR");

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
      <div className="flex items-center gap-3">
        <div
          className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center"
          style={{ background: "var(--secondary-light)", border: "1px solid rgba(91,110,245,0.2)" }}
        >
          <Stethoscope className="w-4 h-4" style={{ color: "var(--secondary)" }} />
        </div>
        <h1 className="font-display font-semibold text-[22px] text-[var(--text-1)]">
          {title}
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Role badge */}
        <span
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: "var(--secondary-light)", color: "var(--secondary)", border: "1px solid rgba(91,110,245,0.2)" }}
        >
          <Stethoscope className="w-3 h-3" />
          Doctor
        </span>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full transition-all hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-3)" }}
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--danger)" }}
          />
        </button>

        {/* Doctor Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-white text-xs cursor-pointer"
          style={{
            background: "linear-gradient(135deg, var(--secondary), var(--primary))",
            boxShadow: "0 4px 12px rgba(91,110,245,0.30)",
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
