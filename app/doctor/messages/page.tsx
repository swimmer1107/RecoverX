"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search, Send, Phone, Video, MoreHorizontal,
  CheckCheck, Clock, RefreshCw,
} from "lucide-react";
import { getSupabase, DEMO_DOCTOR, fmtTime } from "../../lib/supabase";
import { PATIENTS } from "../patients/data";

// ── Types ──────────────────────────────────────────────────────────────────
type Msg    = { id: string; from: "doctor" | "patient"; text: string; time: string; read: boolean };
type Thread = { id: string; patientId: string; patientName: string; injury: string; lastMsg: string; lastTime: string; unread: number; messages: Msg[] };

const QUICK_REPLIES = [
  "How is your pain today (0–10)?",
  "Please complete today's session when you feel ready.",
  "I've reviewed your latest session — great progress!",
  "Please rest today and contact me if pain exceeds 7/10.",
  "Your protocol has been updated. Check your session page.",
];

// ── Fallback threads built from PATIENTS static data ──────────────────────
function buildFallback(): Thread[] {
  return PATIENTS.map((p, i) => ({
    id: p.id,
    patientId: p.id,
    patientName: p.name,
    injury: `${p.injury} W${p.week}`,
    lastMsg: i === 0 ? "I've been having more pain than usual..." : "Thanks for the update, Doctor.",
    lastTime: i === 0 ? "10:32 AM" : i === 1 ? "Yesterday" : `May ${20 - i}`,
    unread: i === 0 ? 2 : 0,
    messages: i === 0
      ? [
          { id: "m1", from: "patient" as const, text: "Good morning Doctor. I've been having more pain than usual today.", time: "10:28 AM", read: true },
          { id: "m2", from: "patient" as const, text: "Should I skip today's session?", time: "10:32 AM", read: false },
          { id: "m3", from: "doctor"  as const, text: "Good morning. Please rate your pain on a scale of 1–10 right now.", time: "10:35 AM", read: true },
        ]
      : [
          { id: `m-${p.id}`, from: "doctor" as const, text: `Hi ${p.name.split(" ")[0]}, your latest session looks good. Keep it up!`, time: `May ${20 - i}`, read: true },
        ],
  }));
}

// ── Supabase helpers ───────────────────────────────────────────────────────
async function fetchMessages(patientId: string): Promise<Msg[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("messages")
    .select("id, from_role, text, read, created_at")
    .or(`and(from_user.eq.${DEMO_DOCTOR},to_user.eq.${patientId}),and(from_user.eq.${patientId},to_user.eq.${DEMO_DOCTOR})`)
    .order("created_at", { ascending: true })
    .limit(100);
  if (!data) return [];
  return data.map(m => ({
    id: String(m.id),
    from: m.from_role as "doctor" | "patient",
    text: m.text,
    time: fmtTime(m.created_at),
    read: m.read,
  }));
}

async function sendToDb(patientId: string, text: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("messages")
    .insert({ from_user: DEMO_DOCTOR, to_user: patientId, from_role: "doctor", text, read: false })
    .select("id")
    .single();
  return data?.id ? String(data.id) : null;
}

async function markRead(patientId: string) {
  const sb = getSupabase();
  if (!sb) return;
  await sb
    .from("messages")
    .update({ read: true })
    .eq("to_user", DEMO_DOCTOR)
    .eq("from_user", patientId);
}

// ── Component ──────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [threads, setThreads]   = useState<Thread[]>(buildFallback);
  const [activeId, setActiveId] = useState<string>(PATIENTS[0]?.id ?? "p1");
  const [search, setSearch]     = useState("");
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active   = threads.find(t => t.id === activeId) ?? threads[0];
  const filtered = threads.filter(t =>
    t.patientName.toLowerCase().includes(search.toLowerCase()) ||
    t.injury.toLowerCase().includes(search.toLowerCase())
  );
  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  // Load messages for active thread from Supabase
  const loadMessages = useCallback(async (patientId: string) => {
    setLoading(true);
    try {
      const msgs = await fetchMessages(patientId);
      if (msgs.length > 0) {
        setThreads(prev => prev.map(t =>
          t.id === patientId
            ? { ...t, messages: msgs, unread: 0, lastMsg: msgs[msgs.length - 1].text, lastTime: msgs[msgs.length - 1].time }
            : t
        ));
      } else {
        // No DB messages — keep fallback, just clear unread
        setThreads(prev => prev.map(t =>
          t.id === patientId ? { ...t, unread: 0, messages: t.messages.map(m => ({ ...m, read: true })) } : t
        ));
      }
      await markRead(patientId);
    } catch {
      // Silently fall back to static data
      setThreads(prev => prev.map(t =>
        t.id === patientId ? { ...t, unread: 0 } : t
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch thread
  useEffect(() => {
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const tempId = `temp-${Date.now()}`;
    const newMsg: Msg = { id: tempId, from: "doctor", text, time: now, read: true };

    // Optimistic update
    setThreads(prev => prev.map(t =>
      t.id === activeId
        ? { ...t, messages: [...t.messages, newMsg], lastMsg: text, lastTime: "Just now" }
        : t
    ));
    setInput("");

    // Persist to DB
    const dbId = await sendToDb(activeId, text);
    if (dbId) {
      setThreads(prev => prev.map(t =>
        t.id === activeId
          ? { ...t, messages: t.messages.map(m => m.id === tempId ? { ...m, id: dbId } : m) }
          : t
      ));
    }
    setSending(false);
  }

  return (
    <div className="animate-in fade-in duration-500" style={{ height: "calc(100vh - 128px)", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
          Messages
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-2)" }}>
          Direct communication with your patients.
          {totalUnread > 0 && (
            <span style={{ marginLeft: 8, background: "var(--danger)", color: "#fff", padding: "2px 8px", borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>
              {totalUnread} unread
            </span>
          )}
        </p>
      </div>

      {/* Main 2-col layout */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr", background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden", minHeight: 0 }}>

        {/* ── Thread list ── */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-3)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patients..."
                style={{ paddingLeft: "34px !important", padding: "8px 12px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--bg-input)", fontSize: 13, width: "100%", outline: "none", color: "var(--text-1)" } as React.CSSProperties}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map(t => (
              <div
                key={t.id}
                onClick={() => setActiveId(t.id)}
                style={{
                  padding: "13px 14px", cursor: "pointer", transition: "background 0.15s",
                  background: activeId === t.id ? "var(--secondary-light)" : "transparent",
                  borderLeft: `3px solid ${activeId === t.id ? "var(--secondary)" : "transparent"}`,
                  borderBottom: "1px solid #F0F4F8",
                }}
                onMouseEnter={e => { if (activeId !== t.id) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { if (activeId !== t.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {/* Avatar with unread badge */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--secondary-light), var(--primary-light))", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "var(--secondary)" }}>
                      {t.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    {t.unread > 0 && (
                      <span style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: "var(--danger)", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: t.unread > 0 ? 700 : 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{t.patientName}</span>
                      <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-data)", flexShrink: 0 }}>{t.lastTime}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{t.injury}</div>
                    <div style={{ fontSize: 12, color: t.unread > 0 ? "var(--text-2)" : "var(--text-3)", fontWeight: t.unread > 0 ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.lastMsg}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Chat header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--secondary-light), var(--primary-light))", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "var(--secondary)" }}>
                {active?.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{active?.patientName}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{active?.injury}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {loading && <RefreshCw style={{ width: 14, height: 14, color: "var(--text-3)", animation: "spin 1s linear infinite" }} />}
              {[Phone, Video, MoreHorizontal].map((Icon, i) => (
                <button key={i} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <Icon style={{ width: 15, height: 15 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
            {active?.messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "doctor" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "72%", padding: "10px 14px",
                  borderRadius: msg.from === "doctor" ? "var(--r-lg) var(--r-lg) 4px var(--r-lg)" : "var(--r-lg) var(--r-lg) var(--r-lg) 4px",
                  background: msg.from === "doctor" ? "var(--secondary)" : "var(--bg-subtle)",
                  color: msg.from === "doctor" ? "#fff" : "var(--text-1)",
                  border: msg.from === "doctor" ? "none" : "1px solid var(--border)",
                  boxShadow: "var(--shadow-xs)",
                }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{msg.text}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>{msg.time}</span>
                    {msg.from === "doctor" && (
                      msg.read
                        ? <CheckCheck style={{ width: 12, height: 12, opacity: 0.8 }} />
                        : <Clock style={{ width: 11, height: 11, opacity: 0.6 }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div style={{ padding: "6px 20px 0", display: "flex", gap: 6, overflowX: "auto", flexWrap: "nowrap" }}>
            {QUICK_REPLIES.map((qr, i) => (
              <button key={i} onClick={() => setInput(qr)}
                style={{ padding: "4px 12px", borderRadius: "var(--r-full)", border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-2)", fontSize: 11, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--secondary-light)"; e.currentTarget.style.borderColor = "var(--secondary)"; e.currentTarget.style.color = "var(--secondary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}>
                {qr}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 20px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={2}
              style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--r-lg)", border: "1.5px solid var(--border)", background: "var(--bg-input)", fontSize: 14, color: "var(--text-1)", resize: "none", outline: "none", fontFamily: "var(--font-body)", lineHeight: 1.5, transition: "border-color 0.2s, box-shadow 0.2s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "var(--secondary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91,110,245,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: input.trim() && !sending ? "var(--secondary)" : "var(--border)", color: input.trim() && !sending ? "#fff" : "var(--text-4)", cursor: input.trim() && !sending ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", boxShadow: input.trim() ? "0 4px 14px rgba(91,110,245,0.30)" : "none" }}
            >
              {sending
                ? <RefreshCw style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                : <Send style={{ width: 18, height: 18 }} />
              }
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
