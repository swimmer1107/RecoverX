"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutGrid, Users, FileText, ClipboardList,
  MessageCircle, Settings, LogOut, Stethoscope, BarChart2,
} from "lucide-react";
import { getUser, clearUser, getInitials } from "../../lib/auth";

const mainLinks = [
  { href: "/doctor/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/doctor/patients", label: "My Patients", icon: Users },
  { href: "/doctor/prescriptions", label: "Prescriptions", icon: ClipboardList },
  { href: "/doctor/reports", label: "Reports & Notes", icon: FileText },
  { href: "/doctor/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/doctor/messages", label: "Messages", icon: MessageCircle },
];

const bottomLinks = [
  { href: "/doctor/settings", label: "Settings", icon: Settings },
];

export default function DoctorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [doctor, setDoctor] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    setDoctor(getUser());
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearUser();
    router.push("/");
  };

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 h-[44px] px-3 rounded-[var(--r-sm)] text-sm transition-all group border-l-2 ${active
      ? "text-[var(--secondary)] bg-[var(--secondary-light)] border-l-[var(--secondary)] font-medium"
      : "text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg-hover)] border-l-transparent"
    }`;

  const iconClass = (active: boolean) =>
    `w-[18px] h-[18px] ${active ? "text-[var(--secondary)]" : "text-[var(--text-3)] group-hover:text-[var(--text-2)]"}`;

  return (
    <aside
      className="hidden md:flex md:w-[64px] lg:w-[260px] h-screen fixed left-0 top-0 flex-col z-40 transition-colors"
      style={{
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div
        className="h-16 flex items-center px-3 lg:px-6 justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/doctor/dashboard" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, var(--secondary), var(--primary))" }}
          >
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div className="hidden lg:block">
            <span
              className="font-display font-bold text-base tracking-tight"
              style={{
                background: "linear-gradient(135deg, var(--secondary), var(--primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              RecoverX
            </span>
            <div className="text-[9px] tracking-[3px] text-[var(--text-3)] font-medium uppercase mt-[-2px]">
              CLINIC
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        {/* Role Label */}
        <div className="hidden lg:block px-3 mb-3">
          <span
            className="text-[10px] font-semibold tracking-[2px] uppercase px-2 py-1 rounded-full"
            style={{ background: "var(--secondary-light)", color: "var(--secondary)" }}
          >
            Doctor Portal
          </span>
        </div>

        {mainLinks.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} className={linkClass(active)}>
              <link.icon className={iconClass(active)} />
              <span className="hidden lg:inline">{link.label}</span>
            </Link>
          );
        })}

        <div className="my-4 h-[1px] mx-3" style={{ background: "var(--border)" }} />

        {bottomLinks.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} className={linkClass(active)}>
              <link.icon className={iconClass(active)} />
              <span className="hidden lg:inline">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Doctor Profile Footer */}
      <div
        className="p-4 transition-colors hover:bg-[var(--bg-hover)]"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white text-sm shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--secondary), var(--primary))",
                boxShadow: "0 4px 12px rgba(91,110,245,0.30)",
              }}
            >
              {doctor ? getInitials(doctor.name) : "DR"}
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <div className="font-display font-semibold text-[var(--text-1)] text-sm truncate">
                {doctor ? doctor.name : "Dr. Priya Nair"}
              </div>
              <div className="font-body text-xs text-[var(--text-3)] truncate">
                {doctor ? doctor.email : "Orthopedic Surgeon"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-[var(--text-3)] hover:text-[var(--danger)] rounded-full shrink-0 transition-all hover:bg-[var(--danger-light)]"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
