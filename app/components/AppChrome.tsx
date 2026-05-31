"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutGrid, MessageCircle, PlayCircle, User, X } from "lucide-react";
import { useEffect, useState } from "react";

const appRoutes = [
  "/dashboard", "/session", "/activity", "/reports",
  "/checkin", "/faq", "/profile", "/settings", "/clinical-trust",
  "/find-doctors", "/emergency", "/subscription",
];

const mobileTabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/session", label: "Session", icon: PlayCircle },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/faq", label: "FAQ", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppRoute = appRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const [showSafety, setShowSafety] = useState(false);

  useEffect(() => {
    setShowSafety(
      isAppRoute &&
      sessionStorage.getItem("antigravity-safety-banner") !== "dismissed"
    );
  }, [isAppRoute, pathname]);

  function dismissBanner() {
    sessionStorage.setItem("antigravity-safety-banner", "dismissed");
    setShowSafety(false);
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={isAppRoute ? "pb-16 md:pb-0" : ""}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {showSafety && (
        <div
          id="safety-banner"
          className="fixed bottom-16 left-0 right-0 z-[120] flex items-center justify-center gap-3 px-5 py-2 text-center text-xs md:bottom-0"
          style={{
            background: "var(--warn-light)",
            borderTop: "1px solid rgba(232,147,10,0.25)",
            color: "var(--warn)",
          }}
        >
          <span>
            ⚕ RecoverX supports — it does not replace — your licensed physiotherapist.
          </span>
          <button
            onClick={dismissBanner}
            className="text-[var(--text-3)] transition-colors hover:text-[var(--text-1)]"
            aria-label="Dismiss safety banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isAppRoute && (
        <nav className="mobile-tabs md:hidden">
          {mobileTabs.map((tab) => {
            const active =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${active ? "text-[var(--primary)]" : "text-[var(--text-3)]"
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
