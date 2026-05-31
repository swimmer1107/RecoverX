"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Brush, Line, LineChart,
  ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { getBrowserSupabase, DEMO_USER } from "../../lib/supabase";
import { getUser } from "../../lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────
type Session = {
  id: number;
  started_at: string;
  exercise_name: string;
  duration_seconds: number;
  achieved_angle: number;
  target_angle: number;
  rep_count: number;
  correct_reps: number;
  pain_before: number;
  pain_after: number;
  status: "COMPLETED" | "ABANDONED";
  angle_log: { t: number; a: number }[];
  feedback_log: { text: string; type: string; t: number }[];
  notes: string;
  week: number;
};

type Checkin = { date: string; pain: number };

// ── Fallback data (shown when Supabase unavailable) ────────────────────────
const FALLBACK_SESSIONS: Session[] = Array.from({ length: 18 }, (_, i) => {
  const date = new Date(2026, 4, 4 + i);
  const exercise = ["Knee Flexion", "Heel Slides", "Straight Leg Raise", "Quad Sets"][i % 4];
  const achieved = 62 + i + (i % 3) * 4;
  return {
    id: i + 1, started_at: date.toISOString(), exercise_name: exercise,
    duration_seconds: 540 + i * 18, achieved_angle: achieved, target_angle: 90,
    rep_count: 10, correct_reps: Math.min(10, 5 + (i % 6)),
    pain_before: 5 - (i > 8 ? 1 : 0), pain_after: Math.max(2, 6 - Math.floor(i / 5)),
    status: i === 3 ? "ABANDONED" : "COMPLETED",
    angle_log: Array.from({ length: 12 }, (_, p) => ({ t: p * 30, a: Math.round(25 + p * (achieved / 14) + Math.sin(p) * 5) })),
    feedback_log: [
      { text: "Nice control. Keep that rhythm.", type: "encouragement", t: 32_000 },
      { text: "Gently bend a little more.", type: "correction", t: 75_000 },
    ],
    notes: i % 2 ? "Mild stiffness at start, improved after warm-up." : "Good session with steady form.",
    week: Math.floor(i / 5) + 1,
  };
});

const FALLBACK_CHECKINS: Checkin[] = Array.from({ length: 18 }, (_, i) => ({
  date: new Date(2026, 4, 4 + i).toISOString(),
  pain: Math.max(2, 7 - Math.floor(i / 4) + (i % 3 === 0 ? 1 : 0)),
}));

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(v: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(v));
}
function fmtDuration(s: number) { return `${Math.floor(s / 60)}m ${s % 60}s`; }
function painColor(v: number) {
  if (v <= 3) return "var(--accent)";
  if (v <= 6) return "var(--warn)";
  return "var(--danger)";
}

const tooltipStyle = {
  backgroundColor: "#fff", borderColor: "var(--border)",
  borderRadius: "8px", color: "var(--text-1)", boxShadow: "var(--shadow-md)",
};

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string | number }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: 6 }} />;
}

// ── Feature 2: Recovery Passport PDF ──────────────────────────────────────
function downloadPassport(sessions: Session[], checkins: Checkin[], patientName: string) {
  const completed = sessions.filter(s => s.status === "COMPLETED");
  const avgRom = completed.length
    ? Math.round(completed.reduce((a, s) => a + s.achieved_angle, 0) / completed.length)
    : 0;
  const bestRom = completed.length ? Math.max(...completed.map(s => s.achieved_angle)) : 0;
  const avgPain = checkins.length
    ? (checkins.reduce((a, c) => a + c.pain, 0) / checkins.length).toFixed(1)
    : "—";

  const rows = completed.slice(-10).map(s => `
    <tr>
      <td>${fmtDate(s.started_at)}</td>
      <td>${s.exercise_name}</td>
      <td style="font-family:monospace;color:#1A6EBD">${s.achieved_angle}°</td>
      <td>${s.correct_reps}/${s.rep_count}</td>
      <td style="color:${s.pain_after <= 3 ? "#0EA874" : s.pain_after <= 6 ? "#E8930A" : "#D94040"}">${s.pain_after}/10</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  body { font-family: -apple-system, sans-serif; color: #0D1B2A; margin: 0; padding: 40px; background: #fff; }
  .header { background: linear-gradient(135deg, #1A6EBD, #0EA874); color: #fff; padding: 32px 40px; border-radius: 16px; margin-bottom: 32px; }
  .header h1 { margin: 0 0 4px; font-size: 28px; font-weight: 800; }
  .header p { margin: 0; opacity: 0.85; font-size: 14px; }
  .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
  .stat { background: #F0F4F8; border-radius: 12px; padding: 20px; text-align: center; }
  .stat-val { font-size: 36px; font-weight: 800; color: #1A6EBD; line-height: 1; margin-bottom: 4px; }
  .stat-label { font-size: 12px; color: #7A94AD; text-transform: uppercase; letter-spacing: 0.8px; }
  h2 { font-size: 18px; font-weight: 700; color: #0D1B2A; margin: 0 0 16px; border-bottom: 2px solid #D8E6F0; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #7A94AD; padding: 8px 12px; text-align: left; border-bottom: 1px solid #D8E6F0; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid #F0F4F8; }
  .footer { font-size: 11px; color: #7A94AD; text-align: center; margin-top: 40px; border-top: 1px solid #D8E6F0; padding-top: 16px; }
</style></head><body>
<div class="header">
  <h1>AntiGravity Recovery Passport</h1>
  <p>Generated ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · Patient: ${patientName}</p>
</div>
<div class="stats">
  <div class="stat"><div class="stat-val">${completed.length}</div><div class="stat-label">Sessions</div></div>
  <div class="stat"><div class="stat-val">${avgRom}°</div><div class="stat-label">Avg ROM</div></div>
  <div class="stat"><div class="stat-val">${bestRom}°</div><div class="stat-label">Best ROM</div></div>
  <div class="stat"><div class="stat-val">${avgPain}</div><div class="stat-label">Avg Pain</div></div>
</div>
<h2>Last 10 Sessions</h2>
<table>
  <thead><tr><th>Date</th><th>Exercise</th><th>Best Angle</th><th>Reps</th><th>Pain After</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">⚕ AntiGravity is an AI-assisted support tool. This document does not constitute medical advice. Always follow your licensed physiotherapist's guidance.</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AntiGravity-Recovery-Passport-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}


// ── Main Page ──────────────────────────────────────────────────────────────
export default function ActivityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("Arjun Sharma");
  const [range, setRange] = useState(14);
  const [exerciseFilter, setExerciseFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  // ── Load real data ──────────────────────────────────────────────────────
  useEffect(() => {
    const user = getUser();
    if (user?.name) {
      setPatientName(user.name);
    }
    async function load() {
      setLoading(true);
      try {
        const sb = await getBrowserSupabase();
        if (sb) {
          const [{ data: sessData }, { data: checkinData }] = await Promise.all([
            sb.from("exercise_sessions")
              .select("*")
              .eq("user_id", DEMO_USER)
              .order("started_at", { ascending: true })
              .limit(100),
            sb.from("daily_checkins")
              .select("created_at, pain_score")
              .eq("user_id", DEMO_USER)
              .order("created_at", { ascending: true })
              .limit(60),
          ]);
          if (sessData && sessData.length > 0) {
            setSessions(sessData.map((s, i) => ({
              ...s,
              id: s.id ?? i + 1,
              week: s.week_number ?? Math.floor(i / 5) + 1,
              angle_log: s.angle_log ?? [],
              feedback_log: s.feedback_log ?? [],
              notes: s.notes ?? "",
            })));
          } else {
            setSessions(FALLBACK_SESSIONS);
          }
          if (checkinData && checkinData.length > 0) {
            setCheckins(checkinData.map(c => ({ date: c.created_at, pain: c.pain_score })));
          } else {
            setCheckins(FALLBACK_CHECKINS);
          }
        } else {
          // Try localStorage
          const keys = Object.keys(localStorage).filter(k => k.startsWith("antigravity-session-"));
          if (keys.length > 0) {
            const local = keys.map(k => JSON.parse(localStorage.getItem(k)!)).sort((a, b) =>
              new Date(a.ended_at ?? 0).getTime() - new Date(b.ended_at ?? 0).getTime()
            );
            setSessions(local.map((s, i) => ({ ...s, id: i + 1, week: s.week_number ?? 1, angle_log: s.angle_log ?? [], feedback_log: s.feedback_log ?? [], notes: "" })));
          } else {
            setSessions(FALLBACK_SESSIONS);
          }
          setCheckins(FALLBACK_CHECKINS);
        }
      } catch {
        setSessions(FALLBACK_SESSIONS);
        setCheckins(FALLBACK_CHECKINS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completed = sessions.filter(s => s.status === "COMPLETED");
  const exercises = ["All", ...Array.from(new Set(sessions.map(s => s.exercise_name)))];
  const filteredSessions = sessions.filter(s => exerciseFilter === "All" || s.exercise_name === exerciseFilter);
  const pagedSessions = filteredSessions.slice((page - 1) * 10, page * 10);
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / 10));

  const romData = useMemo(() => completed.slice(-range).map(s => ({
    date: fmtDate(s.started_at), achieved: s.achieved_angle, target: 90,
  })), [completed, range]);

  const painData = useMemo(() => checkins.slice(-range).map(c => ({
    date: fmtDate(c.date), pain: c.pain,
  })), [checkins, range]);

  const stats = useMemo(() => ({
    total: completed.length,
    avgRom: completed.length ? Math.round(completed.reduce((a, s) => a + s.achieved_angle, 0) / completed.length) : 0,
    bestRom: completed.length ? Math.max(...completed.map(s => s.achieved_angle)) : 0,
    streak: 9,
  }), [completed]);

  const weeks = useMemo(() => Array.from(new Set(sessions.map(s => s.week))).map(w => {
    const ws = sessions.filter(s => s.week === w);
    const wp = checkins.slice((w - 1) * 5, w * 5).map(c => c.pain);
    const avgROM = ws.length ? Math.round(ws.reduce((a, s) => a + s.achieved_angle, 0) / ws.length) : 0;
    return { week: w, weekSessions: ws, weekPain: wp, avgROM,
      insight: `Week ${w}: ${ws.length} sessions, avg ROM ${avgROM}°. Pain scores: ${wp.join(", ") || "—"}. Keep steady rhythm and prioritize clean form.` };
  }), [sessions, checkins]);

  const statCards = [
    { label: "Total Sessions", value: loading ? null : stats.total },
    { label: "Average ROM",    value: loading ? null : `${stats.avgRom}°` },
    { label: "Best ROM Ever",  value: loading ? null : `${stats.bestRom}°` },
    { label: "Current Streak", value: loading ? null : `${stats.streak} days` },
  ];

  return (
    <main className="relative min-h-screen px-5 py-8 md:px-8" style={{ background: "var(--bg-page)" }}>
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 pb-12">

        {/* Header */}
        <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="font-data text-xs uppercase tracking-[0.22em] text-[var(--primary)]">Activity & Analytics</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--text-1)] md:text-4xl">Your Progress</h1>
          </div>
          {/* Feature 2: Recovery Passport */}
          <button
            onClick={() => downloadPassport(sessions, checkins, patientName)}
            disabled={loading || sessions.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: "var(--r-full)",
              background: "var(--primary)", color: "#fff",
              border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
              boxShadow: "0 2px 12px rgba(26,110,189,0.30)",
              transition: "all 0.2s", opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-dark)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.transform = ""; }}
          >
            <Download style={{ width: 16, height: 16 }} />
            Download Recovery Passport
          </button>
        </header>

        {/* Stat Cards */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(({ label, value }) => (
            <div key={label} style={{
              background: "#fff", border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)", padding: "20px",
              boxShadow: "var(--shadow-card)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)", marginBottom: 10 }}>{label}</div>
              {value === null
                ? <Skeleton h={36} w="60%" />
                : <div style={{ fontFamily: "var(--font-data)", fontSize: 30, color: "var(--text-1)", fontWeight: 600 }}>{value}</div>
              }
            </div>
          ))}
        </section>

        {/* ROM Chart */}
        <section style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">ROM Progress</h2>
            <div style={{ display: "flex", gap: 8 }}>
              {[7, 14, 30].map(v => (
                <button key={v} onClick={() => setRange(v)} style={{
                  padding: "5px 14px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${range === v ? "var(--primary)" : "var(--border)"}`,
                  background: range === v ? "var(--primary-light)" : "transparent",
                  color: range === v ? "var(--primary)" : "var(--text-3)",
                }}>{v}d</button>
              ))}
            </div>
          </div>
          <div style={{ height: 340 }}>
            {loading ? <Skeleton h={340} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={romData} margin={{ left: -20, right: 24, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="romGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A6EBD" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1A6EBD" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <ReferenceLine y={90} stroke="var(--accent)" strokeDasharray="6 3" strokeWidth={1.5}
                    label={{ value: "Target 90°", fill: "var(--accent)", fontSize: 11 }} />
                  <Area type="monotone" dataKey="achieved" stroke="#1A6EBD" strokeWidth={2.5}
                    fill="url(#romGrad)"
                    dot={{ fill: "#1A6EBD", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#1A6EBD", stroke: "#fff", strokeWidth: 2 }} />
                  <Brush dataKey="date" height={22} stroke="var(--primary)" travellerWidth={8} fill="#F0F4F8" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Pain Trend */}
        <section style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h2 className="mb-5 font-display text-xl font-semibold text-[var(--text-1)]">Pain Trend</h2>
          <div style={{ height: 260 }}>
            {loading ? <Skeleton h={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={painData} margin={{ left: -20, right: 24, top: 12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <ReferenceArea y1={7} y2={10} fill="var(--danger)" fillOpacity={0.07}
                    label={{ value: "high pain zone", fill: "var(--danger)", fontSize: 11 }} />
                  <Line type="monotone" dataKey="pain" stroke="var(--danger)" strokeWidth={2}
                    dot={(props) => <circle cx={props.cx} cy={props.cy} r={5}
                      fill={painColor(Number(props.payload.pain))} stroke="#fff" strokeWidth={2} />} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Session History Table */}
        <section style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Session History</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <select value={exerciseFilter} onChange={e => { setExerciseFilter(e.target.value); setPage(1); }}
                style={{ borderRadius: "var(--r-full)", border: "1px solid var(--border)", background: "var(--bg-input)", padding: "6px 14px", fontSize: 13, color: "var(--text-1)" }}>
                {exercises.map(ex => <option key={ex}>{ex}</option>)}
              </select>
              <input type="date" style={{ borderRadius: "var(--r-full)", border: "1px solid var(--border)", background: "var(--bg-input)", padding: "6px 14px", fontSize: 13, color: "var(--text-1)" }} />
              <input type="date" style={{ borderRadius: "var(--r-full)", border: "1px solid var(--border)", background: "var(--bg-input)", padding: "6px 14px", fontSize: 13, color: "var(--text-1)" }} />
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3,4,5].map(i => <Skeleton key={i} h={48} />)}
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>No sessions yet</p>
              <p style={{ fontSize: 13 }}>Complete your first session to see your progress here.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Date", "Exercise", "Duration", "Best Angle", "Reps", "Pain →", "Status"].map(h => (
                      <th key={h} style={{ padding: "0 12px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedSessions.map(s => (
                    <Fragment key={s.id}>
                      <tr onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                        style={{ cursor: "pointer", borderBottom: "1px solid #F0F4F8", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}>
                        <td style={{ padding: "14px 12px", fontSize: 13 }}>{fmtDate(s.started_at)}</td>
                        <td style={{ padding: "14px 12px", fontWeight: 600, color: "var(--text-1)", fontSize: 14 }}>{s.exercise_name}</td>
                        <td style={{ padding: "14px 12px", fontFamily: "var(--font-data)", fontSize: 13 }}>{fmtDuration(s.duration_seconds)}</td>
                        <td style={{ padding: "14px 12px", fontFamily: "var(--font-data)", color: "var(--primary)", fontSize: 14 }}>{s.achieved_angle}°</td>
                        <td style={{ padding: "14px 12px", fontSize: 13 }}>{s.correct_reps}/{s.rep_count}</td>
                        <td style={{ padding: "14px 12px", fontSize: 13 }}>{s.pain_before} → {s.pain_after}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span className={`badge ${s.status === "COMPLETED" ? "badge-green" : "badge-amber"}`}>{s.status}</span>
                        </td>
                      </tr>
                      {expandedSession === s.id && (
                        <tr key={`${s.id}-exp`} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td colSpan={7} style={{ background: "var(--bg-subtle)", padding: 16 }}>
                            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                              <div style={{ height: 180, borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "#fff", padding: 12 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={s.angle_log}>
                                    <XAxis dataKey="t" hide />
                                    <YAxis hide domain={[0, 120]} />
                                    <Line type="monotone" dataKey="a" stroke="var(--primary)" strokeWidth={2} dot={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                              <div>
                                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>Voice feedback</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {s.feedback_log.map(f => (
                                    <div key={f.t} style={{
                                      borderRadius: "var(--r-sm)", border: "1px solid var(--border)",
                                      borderLeft: `3px solid ${f.type === "encouragement" ? "var(--accent)" : "var(--warn)"}`,
                                      background: f.type === "encouragement" ? "var(--accent-light)" : "var(--warn-light)",
                                      padding: "8px 12px", fontSize: 13, color: "var(--text-2)",
                                    }}>{f.text}</div>
                                  ))}
                                </div>
                                <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-3)" }}>{s.notes}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setPage(v => Math.max(1, v - 1))} className="btn-ghost" style={{ padding: "6px 16px", fontSize: 12 }}>Prev</button>
            <span style={{ alignSelf: "center", fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-3)" }}>{page}/{totalPages}</span>
            <button onClick={() => setPage(v => Math.min(totalPages, v + 1))} className="btn-ghost" style={{ padding: "6px 16px", fontSize: 12 }}>Next</button>
          </div>
        </section>

        {/* Weekly Summaries */}
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Weekly Summaries</h2>
          {loading ? [1,2,3].map(i => <Skeleton key={i} h={64} />) : weeks.map(w => (
            <div key={w.week} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
              <button onClick={() => setExpandedWeek(expandedWeek === w.week ? null : w.week)}
                style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: 20, textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Week {w.week}</div>
                  <div style={{ marginTop: 2, fontSize: 13, color: "var(--text-3)" }}>{w.weekSessions.length} sessions · Avg ROM {w.avgROM}° · Pain trend ↓</div>
                </div>
                {expandedWeek === w.week ? <ChevronDown style={{ width: 18, height: 18, color: "var(--text-3)" }} /> : <ChevronRight style={{ width: 18, height: 18, color: "var(--text-3)" }} />}
              </button>
              {expandedWeek === w.week && (
                <div style={{ borderTop: "1px solid var(--border)", padding: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[["Sessions", w.weekSessions.length], ["Avg ROM", `${w.avgROM}°`], ["Target", "90°"]].map(([l, v]) => (
                      <div key={l as string} style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{l}</div>
                        <div style={{ fontFamily: "var(--font-data)", fontSize: 18, color: "var(--text-1)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-2)" }}>{w.insight}</p>
                </div>
              )}
            </div>
          ))}
        </section>

      </div>
    </main>
  );
}
