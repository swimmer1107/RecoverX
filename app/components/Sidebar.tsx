"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutGrid, PlayCircle, BarChart2, FileText,
  CalendarHeart, MessageCircle, User, Settings, LogOut,
  MapPin, AlertTriangle,
} from "lucide-react";
import { getUser, clearUser, getInitials } from "../lib/auth";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/session", label: "Start Session", icon: PlayCircle },
  { href: "/activity", label: "Activity", icon: BarChart2 },
  { href: "/reports", label: "My Report", icon: FileText },
  { href: "/checkin", label: "Daily Check-in", icon: CalendarHeart },
  { href: "/faq", label: "AI Coach FAQ", icon: MessageCircle },
  { href: "/find-doctors", label: "Find Doctors", icon: MapPin },
];

const bottomLinks = [
  { href: "/emergency", label: "Emergency", icon: AlertTriangle },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearUser();
    router.push("/");
  };

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 h-[44px] px-3 rounded-[var(--r-sm)] text-sm transition-all group border-l-2 ${active
      ? "text-[var(--primary)] bg-[var(--primary-light)] border-l-[var(--primary)] font-medium"
      : "text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg-hover)] border-l-transparent"
    }`;

  const iconClass = (active: boolean) =>
    `w-[18px] h-[18px] ${active ? "text-[var(--primary)]" : "text-[var(--text-3)] group-hover:text-[var(--text-2)]"}`;

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
        <Link href="/dashboard" className="flex items-center gap-1">
          <span
            className="font-display font-bold text-xl tracking-tight"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Recover
          </span>
          <span className="hidden lg:inline text-[9px] tracking-[3px] text-[var(--text-3)] font-medium uppercase mt-[-8px]">
            X
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
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
          const isEmergency = link.href === "/emergency";
          if (isEmergency) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 h-[44px] px-3 rounded-[var(--r-sm)] text-sm transition-all group border-l-2 ${
                  active
                    ? "text-[var(--danger)] bg-[var(--danger-light)] border-l-[var(--danger)] font-medium"
                    : "text-[var(--danger)] hover:bg-[var(--danger-light)] border-l-transparent"
                }`}
              >
                <link.icon className="w-[18px] h-[18px] text-[var(--danger)]" />
                <span className="hidden lg:inline font-semibold">{link.label}</span>
              </Link>
            );
          }
          return (
            <Link key={link.href} href={link.href} className={linkClass(active)}>
              <link.icon className={iconClass(active)} />
              <span className="hidden lg:inline">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div
        className="p-4 transition-colors hover:bg-[var(--bg-hover)]"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white text-sm shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                boxShadow: "var(--shadow-blue)",
              }}
            >
              {user ? getInitials(user.name) : "AS"}
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <div className="font-display font-semibold text-[var(--text-1)] text-sm truncate">
                {user ? user.name : "Arjun Sharma"}
              </div>
              <div className="font-body text-xs text-[var(--text-3)] truncate">
                {user ? user.email : "arjun@example.com"}
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
