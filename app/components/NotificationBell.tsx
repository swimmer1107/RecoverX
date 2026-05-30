"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

type NotificationType = "GREAT_PROGRESS" | "PAIN_ALERT" | "REPORT_READY" | "MILESTONE" | "SESSION_REMINDER" | "STREAK";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: number;
  href: string;
  read: boolean;
};

const defaults: Notification[] = [
  {
    id: "n1",
    type: "REPORT_READY",
    title: "Report ready",
    message: "Your exercise plan can now use your uploaded report.",
    time: Date.now() - 1_800_000,
    href: "/reports",
    read: false,
  },
  {
    id: "n2",
    type: "SESSION_REMINDER",
    title: "Session reminder",
    message: "Knee Flexion is waiting for today.",
    time: Date.now() - 7_200_000,
    href: "/session",
    read: false,
  },
  {
    id: "n3",
    type: "STREAK",
    title: "You're on a streak!",
    message: "Three sessions logged this week.",
    time: Date.now() - 86_400_000,
    href: "/activity",
    read: true,
  },
];

const meta: Record<NotificationType, { icon: string; color: string }> = {
  GREAT_PROGRESS: { icon: "🏆", color: "var(--accent)" },
  PAIN_ALERT: { icon: "⚠️", color: "var(--danger)" },
  REPORT_READY: { icon: "📄", color: "var(--primary)" },
  MILESTONE: { icon: "🎯", color: "var(--secondary)" },
  SESSION_REMINDER: { icon: "⏰", color: "var(--primary)" },
  STREAK: { icon: "🔥", color: "var(--warn)" },
};

function loadNotifications() {
  if (typeof window === "undefined") return defaults;
  const raw = window.localStorage.getItem("antigravity-notifications");
  if (!raw) {
    window.localStorage.setItem("antigravity-notifications", JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(raw) as Notification[];
  } catch {
    return defaults;
  }
}

function timeAgo(time: number) {
  const minutes = Math.max(1, Math.round((Date.now() - time) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    setItems(loadNotifications());
  }, []);

  function persist(next: Notification[]) {
    setItems(next);
    window.localStorage.setItem("antigravity-notifications", JSON.stringify(next));
  }

  const unread = items.filter((item) => !item.read).length;

  function markAllRead() {
    persist(items.map((item) => ({ ...item, read: true })));
  }

  function openNotification(item: Notification) {
    persist(items.map((candidate) => candidate.id === item.id ? { ...candidate, read: true } : candidate));
    setOpen(false);
    router.push(item.href);
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="relative text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--danger)] px-1 font-data text-[10px] font-bold text-white shadow-[0_0_8px_var(--danger-glow)]">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-[340px] max-w-[calc(100vw-32px)] rounded-[var(--r-md)] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--shadow-float)] backdrop-blur-[var(--glass-blur)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
            <h3 className="font-display text-sm font-semibold text-[var(--text-1)]">Notifications</h3>
            <button onClick={markAllRead} className="text-xs text-[var(--primary)]">Mark all as read</button>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--text-3)]">No notifications yet</div>
            ) : (
              items.map((item) => {
                const itemMeta = meta[item.type];
                return (
                  <button key={item.id} onClick={() => openNotification(item)} className="flex w-full gap-3 rounded-[var(--r-sm)] p-3 text-left transition-colors hover:bg-[rgba(255,255,255,0.04)]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${itemMeta.color}22`, color: itemMeta.color }}>
                      {itemMeta.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-display text-sm font-semibold text-[var(--text-1)]">{item.title}</span>
                        {!item.read && <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--text-2)]">{item.message}</span>
                      <span className="mt-1 block text-[11px] text-[var(--text-3)]">{timeAgo(item.time)}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function createNotification(type: NotificationType, title: string, message: string, href: string) {
  if (typeof window === "undefined") return;
  const items = loadNotifications();
  const next = [{ id: `${Date.now()}-${Math.random()}`, type, title, message, href, time: Date.now(), read: false }, ...items].slice(0, 30);
  window.localStorage.setItem("antigravity-notifications", JSON.stringify(next));
}
