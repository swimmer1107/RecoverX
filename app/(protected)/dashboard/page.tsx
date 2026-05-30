"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlayCircle, ChevronRight, Flame,
  Smile, Frown, Meh, Bell,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { getBrowserSupabase, DEMO_USER } from "../../lib/supabase";
import { getUser } from "../../lib/auth";

const FALLBACK_ROM = [
  { date: "May 8", achieved: 45 }, { date: "May 9", achieved: 48 },
  { date: "May 10", achieved: 52 }, { date: "May 11", achieved: 55 },
  { date: "May 12", achieved: 58 }, { date: "May 13", achieved: 60 },
  { date: "May 14", achieved: 65 }, { date: "May 15", achieved: 64 },
  { date: "May 16", achieved: 68 }, { date: "May 17", achieved: 72 },
  { date: "May 18", achieved: 75 }, { date: "May 19", achieved: 78 },
  { date: "May 20", achieved: 80 }, { date: "May 21", achieved: 82 },
];

function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string | number }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: 6 }} />;
}

const FALLBACK_RECENT = [
  { d: "May 20", e: "Heel Slides",  a: "80°", r: "10/10", s: "Completed", badge: "badge-green" },
  { d: "May 19", e: "Straight Leg", a: "15°", r: "8/10",  s: "Completed", badge: "badge-green" },
  { d: "May 18", e: "Heel Slides",  a: "78°", r: "5/10",  s: "Abandoned", badge: "badge-gray"  },
];

// ── Stat Card ──────────────────────────────────────────────────────────────
type StatColor = "blue" | "green" | "amber" | "purple";
const colorMap: Record<StatColor, { bg: string; icon: string; border: string }> = {
  blue:   { bg: "var(--primary-light)",   icon: "var(--primary)",   border: "rgba(26,110,189,0.15)" },
  green:  { bg: "var(--accent-light)",    icon: "var(--accent)",    border: "rgba(14,168,116,0.15)" },
  amber:  { bg: "var(--warn-light)",      icon: "var(--warn)",      border: "rgba(232,147,10,0.15)" },
  purple: { bg: "var(--secondary-light)", icon: "var(--secondary)", border: "rgba(91,110,245,0.15)" },
};

function StatCard({ emoji, label, value, sub, color }: {
  emoji: string; label: string; value: string; sub: string; color: StatColor;
}) {
  const c = colorMap[color];
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${c.border}`,
        borderRadius: "var(--r-xl)",
        padding: "22px 20px",
        boxShadow: "var(--shadow-card)",
        transition: "all 0.22s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-hover)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: c.bg, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>{emoji}</div>
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800,
        color: "var(--text-1)", lineHeight: 1, marginBottom: 6,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{sub}</div>
    </div>
  );
}

// ── Alert Strip ────────────────────────────────────────────────────────────
function AlertStrip({ type, message, href }: { type: "info" | "warning" | "danger"; message: string; href: string }) {
  const styles = {
    info:    { bg: "var(--primary-light)", border: "var(--primary-mid)",  text: "var(--primary)", icon: "📋" },
    warning: { bg: "var(--warn-light)",    border: "#FFD59E",             text: "var(--warn)",    icon: "⚠️" },
    danger:  { bg: "var(--danger-light)",  border: "#FFBEBE",             text: "var(--danger)",  icon: "🚨" },
  };
  const s = styles[type];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: "var(--r-md)", padding: "12px 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ fontSize: 13, color: s.text, fontWeight: 500 }}>
        {s.icon} {message}
      </span>
      <Link href={href} style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "rgba(255,255,255,0.7)", border: `1px solid ${s.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <ChevronRight style={{ width: 14, height: 14, color: s.text }} />
      </Link>
    </div>
  );
}

// ── Custom Chart Tooltip ───────────────────────────────────────────────────
function LightTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)",
      borderRadius: "var(--r-md)", padding: "10px 14px",
      boxShadow: "var(--shadow-md)",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "var(--primary)", fontFamily: "var(--font-data)", fontSize: 20, fontWeight: 500 }}>
        {payload[0]?.value}°
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)" }}>Target 90°</div>
    </div>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [painScore, setPainScore] = useState(4);
  const [mounted, setMounted] = useState(false);
  const [activeRange, setActiveRange] = useState("14d");
  const [loading, setLoading] = useState(true);
  const [romData, setRomData] = useState(FALLBACK_ROM);
  const [recentSessions, setRecentSessions] = useState<{ d: string; e: string; a: string; r: string; s: string; badge: string }[]>([]);
  const [stats, setStats] = useState({ sessions: 0, bestAngle: 0, week: 3, pain: -1 });
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    setMounted(true);
    async function load() {
      try {
        const localUser = getUser();
        if (localUser) {
          setPatientName(localUser.name.split(" ")[0] || "Patient");
          setStats(prev => ({ ...prev, week: localUser.week ?? 3 }));
        }

        const sb = await getBrowserSupabase();
        if (sb) {
          const [{ data: sessData }, { data: profile }, { data: checkin }] = await Promise.all([
            sb.from("exercise_sessions")
              .select("started_at, exercise_name, achieved_angle, correct_reps, rep_count, status")
              .eq("user_id", DEMO_USER)
              .order("started_at", { ascending: false })
              .limit(20),
            sb.from("patient_profiles").select("full_name, current_week").eq("user_id", DEMO_USER).single(),
            sb.from("daily_checkins").select("pain_score").eq("user_id", DEMO_USER).order("created_at", { ascending: false }).limit(1).single(),
          ]);

          if (profile && !localUser) {
            setPatientName(profile.full_name?.split(" ")[0] ?? "Arjun");
            setStats(prev => ({ ...prev, week: profile.current_week ?? 3 }));
          }
          if (checkin) {
            setStats(prev => ({ ...prev, pain: checkin.pain_score ?? -1 }));
          }
          if (sessData && sessData.length > 0) {
            const todaySessions = sessData.filter(s => new Date(s.started_at).toDateString() === new Date().toDateString());
            const completedToday = todaySessions.filter(s => s.status === "COMPLETED");
            const bestToday = completedToday.length ? Math.max(...completedToday.map(s => s.achieved_angle)) : 0;
            setStats(prev => ({ ...prev, sessions: completedToday.length, bestAngle: bestToday }));

            const romPoints = [...sessData].reverse().slice(-14).map(s => ({
              date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(s.started_at)),
              achieved: s.achieved_angle,
            }));
            if (romPoints.length > 0) setRomData(romPoints);

            setRecentSessions(sessData.slice(0, 3).map(s => ({
              d: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(s.started_at)),
              e: s.exercise_name,
              a: `${s.achieved_angle}°`,
              r: `${s.correct_reps}/${s.rep_count}`,
              s: s.status === "COMPLETED" ? "Completed" : "Abandoned",
              badge: s.status === "COMPLETED" ? "badge-green" : "badge-gray",
            })));
          } else {
            setRecentSessions(FALLBACK_RECENT);
          }
        } else {
          setRecentSessions(FALLBACK_RECENT);
        }
      } catch {
        setRecentSessions(FALLBACK_RECENT);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Refetch on window focus — catches tab-switch-back after session
    const onFocus = () => {
      const flag = window.localStorage.getItem("antigravity-session-completed");
      if (flag) {
        window.localStorage.removeItem("antigravity-session-completed");
        load();
      } else {
        load();
      }
    };
    window.addEventListener("focus", onFocus);

    // localStorage event — catches same-tab navigation back from session page
    const onStorage = (e: StorageEvent) => {
      if (e.key === "antigravity-session-completed") {
        window.localStorage.removeItem("antigravity-session-completed");
        load();
      }
    };
    window.addEventListener("storage", onStorage);

    // Custom event — fired immediately after session save in same tab
    const onSessionCompleted = () => load();
    window.addEventListener("session-completed", onSessionCompleted);

    // Supabase realtime subscription
    let cleanup: (() => void) | undefined;
    getBrowserSupabase().then(sb => {
      if (!sb) return;
      sb.removeAllChannels();
      const channel = sb
        .channel("dashboard-session-updates")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "exercise_sessions", filter: `user_id=eq.${DEMO_USER}` },
          () => load()
        )
        .subscribe();
      cleanup = () => sb.removeChannel(channel);
    });

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("session-completed", onSessionCompleted);
      cleanup?.();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-8 pb-12">

      {/* ── ROW 1: Welcome ── */}
      <section>
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
              Good morning, {patientName || "Patient"} ☀️
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              You&apos;re on Week {stats.week}. Keep going — consistency is everything.
            </p>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-data)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AlertStrip type="warning" message="Upload your medical report to get your personalized exercise plan" href="/reports" />
          <AlertStrip type="info"    message="Daily check-in pending — takes 30 seconds" href="/checkin" />
        </div>
      </section>

      {/* ── ROW 2: Stat Cards ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        <StatCard emoji="▶️" label="Today's Sessions" value={loading ? "..." : String(stats.sessions)}    sub={loading ? "..." : `${stats.sessions} completed`}   color="blue"   />
        <StatCard emoji="📐" label="Best Angle Today"  value={loading ? "..." : stats.bestAngle ? `${stats.bestAngle}°` : "—°"} sub="Target: 90°" color="green" />
        <StatCard emoji="📅" label="Recovery Week"     value={loading ? "..." : `W${stats.week}`}          sub="of 16 weeks"   color="purple" />
        <StatCard emoji="💊" label="Pain Score"        value={loading ? "..." : stats.pain < 0 ? "—/10" : `${stats.pain}/10`}        sub={loading ? "..." : stats.pain < 0 ? "No data yet" : stats.pain <= 3 ? "Mild" : stats.pain <= 6 ? "Moderate" : "Severe"} color="amber" />
      </section>

      {/* ── ROW 3: Chart + Plan ── */}
      <section style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 24 }}>

        {/* Chart */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: "24px",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>
              ROM Progress
            </h3>
            <div style={{ display: "flex", gap: 6 }}>
              {["7d", "14d", "30d"].map(tf => (
                <button
                  key={tf}
                  onClick={() => setActiveRange(tf)}
                  style={{
                    padding: "5px 12px", borderRadius: "var(--r-full)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${activeRange === tf ? "var(--primary)" : "var(--border)"}`,
                    background: activeRange === tf ? "var(--primary-light)" : "transparent",
                    color: activeRange === tf ? "var(--primary)" : "var(--text-3)",
                    transition: "all 0.15s",
                  }}
                >{tf}</button>
              ))}
            </div>
          </div>

          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={romData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1A6EBD" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1A6EBD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 120]} tick={{ fill: "#7A94AD", fontSize: 11, fontFamily: "var(--font-data)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<LightTooltip />} />
                <ReferenceLine y={90} stroke="#0EA874" strokeDasharray="6 3" strokeWidth={1.5}
                  label={{ value: "Target", fill: "#0EA874", fontSize: 11 }} />
                <Area type="monotone" dataKey="achieved"
                  stroke="#1A6EBD" strokeWidth={2.5}
                  fill="url(#blueGrad)"
                  dot={{ fill: "#1A6EBD", r: 3.5, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#1A6EBD", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Plan */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: "24px",
          boxShadow: "var(--shadow-card)",
          position: "relative", overflow: "hidden",
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>
            Your Plan Today
          </h3>

          {/* Locked overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            backdropFilter: "blur(6px)",
            background: "rgba(255,255,255,0.75)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 24, textAlign: "center",
            borderRadius: "var(--r-xl)",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "var(--bg-subtle)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, marginBottom: 14,
            }}>📋</div>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
              Upload your medical report to see your personalized exercises.
            </p>
            <Link href="/reports" className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>
              Upload Report
            </Link>
          </div>

          {/* Blurred placeholder rows */}
          <div style={{ opacity: 0.25, filter: "blur(3px)", pointerEvents: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: "var(--bg-subtle)", border: "1px solid var(--border)",
                borderRadius: "var(--r-md)", padding: "14px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-1)", marginBottom: 4 }}>Seated Knee Flexion</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className="badge badge-green" style={{ fontSize: 11 }}>Target: 90°</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>3 mins</span>
                  </div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <PlayCircle style={{ width: 16, height: 16, color: "#fff" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── ROW 4: Sessions Table + Check-in ── */}
      <section style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: 24 }}>

        {/* Recent Sessions */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: "24px",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>
              Recent Sessions
            </h3>
            <Link href="/activity" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
              View all →
            </Link>
          </div>

          {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3].map(i => <Skeleton key={i} h={48} />)}
              </div>
            ) : recentSessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-3)", fontSize: 13 }}>
                No sessions yet. <Link href="/session" style={{ color: "var(--primary)" }}>Start your first →</Link>
              </div>
            ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date", "Exercise", "Best Angle", "Reps", "Status"].map(h => (
                  <th key={h} style={{
                    padding: "0 16px 12px", textAlign: "left",
                    fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: 0.8, color: "var(--text-3)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((row, i) => (
                <tr key={i}
                  style={{ borderBottom: "1px solid #F0F4F8", transition: "background 0.15s", cursor: "default" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-2)" }}>{row.d}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{row.e}</td>
                  <td style={{ padding: "14px 16px", fontFamily: "var(--font-data)", fontSize: 14, color: "var(--primary)" }}>{row.a}</td>
                  <td style={{ padding: "14px 16px", fontFamily: "var(--font-data)", fontSize: 14, color: "var(--text-2)" }}>{row.r}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span className={`badge ${row.badge}`}>{row.s}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            )}
        </div>

        {/* Quick Check-in */}
        <div style={{
          background: "linear-gradient(180deg, #fff 0%, var(--accent-light) 100%)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: "24px",
          boxShadow: "var(--shadow-card)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
              Quick Check-in
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 24 }}>How are you feeling today?</p>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-2)", marginBottom: 10 }}>
                Pain Level:{" "}
                <span style={{ fontFamily: "var(--font-data)", color: "var(--warn)", fontWeight: 600 }}>{painScore}/10</span>
              </label>
              <input
                type="range" min="0" max="10"
                value={painScore} onChange={e => setPainScore(parseInt(e.target.value))}
                style={{
                  width: "100%", height: 6, borderRadius: 3,
                  appearance: "none", cursor: "pointer",
                  background: `linear-gradient(to right, var(--accent) 0%, var(--warn) 50%, var(--danger) 100%)`,
                  border: "none", padding: 0,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-2)", marginBottom: 10 }}>Mood</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { icon: <Smile style={{ width: 20, height: 20 }} />, color: "var(--accent)" },
                  { icon: <Meh  style={{ width: 20, height: 20 }} />, color: "var(--primary)", active: true },
                  { icon: <Frown style={{ width: 20, height: 20 }} />, color: "var(--danger)" },
                ].map((btn, i) => (
                  <button key={i} style={{
                    flex: 1, padding: "10px 0",
                    background: btn.active ? "var(--primary-light)" : "var(--bg-input)",
                    border: `1px solid ${btn.active ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "var(--r-sm)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: btn.color, cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {btn.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14 }}>
            Save Check-in
          </button>
        </div>
      </section>

      {/* ── ROW 5: Notifications + Streak ── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Notifications */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: "20px",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>
              <Bell style={{ width: 16, height: 16 }} /> Recent Updates
            </h3>
            <Link href="#" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>View all</Link>
          </div>
          <div
            style={{
              display: "flex", gap: 12, alignItems: "center",
              padding: "10px 12px", borderRadius: "var(--r-md)",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "")}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--accent-light)", color: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Flame style={{ width: 16, height: 16 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Great progress!</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Your average ROM increased by 5° this week.</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-data)", flexShrink: 0 }}>2h ago</div>
          </div>
        </div>

        {/* Streak Card */}
        <div style={{
          background: "linear-gradient(135deg, var(--secondary-light) 0%, rgba(91,110,245,0.06) 100%)",
          border: "1px solid rgba(91,110,245,0.15)",
          borderLeft: "4px solid var(--secondary)",
          borderRadius: "var(--r-xl)", padding: "24px",
          boxShadow: "var(--shadow-card)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: -12, top: -12,
            opacity: 0.08,
          }}>
            <Flame style={{ width: 96, height: 96, color: "var(--secondary)" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text-1)", marginBottom: 16 }}>
              5 Day Streak 🔥
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: i < 3 ? "var(--accent)" : i === 3 ? "var(--primary-light)" : "var(--bg-subtle)",
                  color: i < 3 ? "#fff" : i === 3 ? "var(--primary)" : "var(--text-3)",
                  border: i === 3 ? "1px solid var(--primary)" : "1px solid transparent",
                  boxShadow: i < 3 ? "0 2px 8px rgba(14,168,116,0.30)" : "none",
                }}>
                  {day}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, fontStyle: "italic" }}>
              &quot;You&apos;re 67% through Week 3. Your ROM has improved by 12° this week — you&apos;re ahead of schedule.&quot;
              <span style={{ fontSize: 11, fontStyle: "normal", color: "var(--text-3)", marginLeft: 6 }}>— Gemini AI</span>
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}
