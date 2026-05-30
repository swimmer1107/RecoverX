"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Activity, Award, BarChart2, Calendar } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, Legend,
} from "recharts";
import { getSupabase } from "../../lib/supabase";
import { PATIENTS } from "../patients/data";

// ── Types ──────────────────────────────────────────────────────────────────
type RomPoint   = { week: string; [name: string]: string | number };
type PainPoint  = { week: string; avg: number };
type AdherenceRow = { name: string; adherence: number; sessions: number };
type WeeklyBar  = { day: string; sessions: number };
type RadarPoint = { metric: string; score: number };

const tooltipStyle = {
  backgroundColor: "#fff", borderColor: "var(--border)",
  borderRadius: "8px", color: "var(--text-1)", boxShadow: "var(--shadow-md)",
};

function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: 6 }} />;
}

// ── Fallback static data (shown when Supabase unavailable) ─────────────────
const FB_ROM: RomPoint[] = [
  { week: "W1", avg: 45 }, { week: "W2", avg: 52 }, { week: "W3", avg: 60 },
  { week: "W4", avg: 67 }, { week: "W5", avg: 72 }, { week: "W6", avg: 78 },
];
const FB_PAIN: PainPoint[] = [
  { week: "W1", avg: 6.2 }, { week: "W2", avg: 5.8 }, { week: "W3", avg: 5.1 },
  { week: "W4", avg: 4.6 }, { week: "W5", avg: 4.0 }, { week: "W6", avg: 3.4 },
];
const FB_WEEKLY: WeeklyBar[] = [
  { day: "Mon", sessions: 8 }, { day: "Tue", sessions: 12 }, { day: "Wed", sessions: 10 },
  { day: "Thu", sessions: 15 }, { day: "Fri", sessions: 9 }, { day: "Sat", sessions: 6 }, { day: "Sun", sessions: 3 },
];
const FB_RADAR: RadarPoint[] = [
  { metric: "ROM", score: 78 }, { metric: "Adherence", score: 84 },
  { metric: "Pain Mgmt", score: 72 }, { metric: "Consistency", score: 88 }, { metric: "Milestones", score: 65 },
];


export default function AnalyticsPage() {
  const [range, setRange] = useState("6w");
  const [loading, setLoading] = useState(true);

  // Real data state
  const [romTrend, setRomTrend]         = useState<RomPoint[]>(FB_ROM);
  const [painTrend, setPainTrend]       = useState<PainPoint[]>(FB_PAIN);
  const [adherence, setAdherence]       = useState<AdherenceRow[]>([]);
  const [weeklyBars, setWeeklyBars]     = useState<WeeklyBar[]>(FB_WEEKLY);
  const [radarData]                     = useState<RadarPoint[]>(FB_RADAR);
  const [kpis, setKpis] = useState({
    romImprovement: "+18°", avgAdherence: "84%",
    painReduction: "−2.8", milestones: "14",
  });

  const rangeToLimit: Record<string, number> = { "2w": 14, "4w": 28, "6w": 42, "3m": 90 };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const sb = getSupabase();

      if (sb) {
        try {
          const limit = rangeToLimit[range] ?? 42;

          // 1. All sessions in range
          const { data: sessions } = await sb
            .from("exercise_sessions")
            .select("user_id, achieved_angle, pain_after, started_at, status, week_number")
            .eq("status", "COMPLETED")
            .order("started_at", { ascending: true })
            .limit(limit * 10);

          // 2. All patient profiles (for names + adherence)
          const { data: profiles } = await sb
            .from("patient_profiles")
            .select("user_id, full_name, current_week");

          // 3. Checkins for pain trend
          const { data: checkins } = await sb
            .from("daily_checkins")
            .select("pain_score, created_at")
            .order("created_at", { ascending: true })
            .limit(limit);

          if (sessions && sessions.length > 0) {
            // ROM trend — group by week number
            const byWeek: Record<number, number[]> = {};
            sessions.forEach(s => {
              const w = s.week_number ?? 1;
              if (!byWeek[w]) byWeek[w] = [];
              byWeek[w].push(s.achieved_angle);
            });
            const romPoints: RomPoint[] = Object.entries(byWeek)
              .sort(([a], [b]) => Number(a) - Number(b))
              .slice(-6)
              .map(([w, angles]) => ({
                week: `W${w}`,
                avg: Math.round(angles.reduce((s, a) => s + a, 0) / angles.length),
              }));
            if (romPoints.length > 0) setRomTrend(romPoints);

            // Weekly sessions bar — last 7 days
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const dayCounts: Record<string, number> = {};
            days.forEach(d => (dayCounts[d] = 0));
            const cutoff = Date.now() - 7 * 86_400_000;
            sessions.filter(s => new Date(s.started_at).getTime() > cutoff).forEach(s => {
              const day = days[new Date(s.started_at).getDay()];
              dayCounts[day] = (dayCounts[day] ?? 0) + 1;
            });
            setWeeklyBars(days.map(d => ({ day: d, sessions: dayCounts[d] })));

            // KPIs
            const angles = sessions.map(s => s.achieved_angle);
            const firstHalf = angles.slice(0, Math.floor(angles.length / 2));
            const secondHalf = angles.slice(Math.floor(angles.length / 2));
            const avgFirst = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
            const avgSecond = secondHalf.length ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
            const romDiff = Math.round(avgSecond - avgFirst);

            const pains = sessions.map(s => s.pain_after).filter(Boolean);
            const firstPains = pains.slice(0, Math.floor(pains.length / 2));
            const lastPains = pains.slice(Math.floor(pains.length / 2));
            const painDiff = firstPains.length && lastPains.length
              ? ((firstPains.reduce((a, b) => a + b, 0) / firstPains.length) - (lastPains.reduce((a, b) => a + b, 0) / lastPains.length)).toFixed(1)
              : "2.8";

            setKpis(prev => ({
              ...prev,
              romImprovement: `+${romDiff}°`,
              painReduction: `−${painDiff}`,
            }));
          }

          if (checkins && checkins.length > 0) {
            // Pain trend by week
            const painByWeek: Record<number, number[]> = {};
            checkins.forEach((c, i) => {
              const w = Math.floor(i / 5) + 1;
              if (!painByWeek[w]) painByWeek[w] = [];
              painByWeek[w].push(c.pain_score);
            });
            const painPoints: PainPoint[] = Object.entries(painByWeek)
              .sort(([a], [b]) => Number(a) - Number(b))
              .slice(-6)
              .map(([w, scores]) => ({
                week: `W${w}`,
                avg: parseFloat((scores.reduce((s, p) => s + p, 0) / scores.length).toFixed(1)),
              }));
            if (painPoints.length > 0) setPainTrend(painPoints);
          }

          // Adherence per patient from profiles + sessions
          if (profiles && profiles.length > 0 && sessions && sessions.length > 0) {
            const sessionsByUser: Record<string, number> = {};
            sessions.forEach(s => { sessionsByUser[s.user_id] = (sessionsByUser[s.user_id] ?? 0) + 1; });
            const maxSessions = Math.max(...Object.values(sessionsByUser), 1);
            const rows: AdherenceRow[] = profiles.map(p => {
              const count = sessionsByUser[p.user_id] ?? 0;
              return {
                name: p.full_name ?? p.user_id,
                adherence: Math.min(100, Math.round((count / maxSessions) * 100)),
                sessions: count,
              };
            }).filter(r => r.sessions > 0);
            if (rows.length > 0) setAdherence(rows);
          }

          // Avg adherence KPI
          if (adherence.length > 0) {
            const avg = Math.round(adherence.reduce((s, r) => s + r.adherence, 0) / adherence.length);
            setKpis(prev => ({ ...prev, avgAdherence: `${avg}%` }));
          }

        } catch (err) {
          console.warn("Analytics: Supabase error, using fallback data", err);
        }
      }

      // Always populate adherence from PATIENTS if Supabase didn't fill it
      if (adherence.length === 0) {
        setAdherence(PATIENTS.map(p => ({ name: p.name, adherence: p.adherence, sessions: p.sessions })));
      }

      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const kpiCards = [
    { label: "Avg ROM Improvement", value: kpis.romImprovement, sub: "across all patients",  icon: TrendingUp, color: "green"  },
    { label: "Avg Adherence",       value: kpis.avgAdherence,   sub: "vs 78% last month",    icon: Users,      color: "blue"   },
    { label: "Avg Pain Reduction",  value: kpis.painReduction,  sub: "points over range",    icon: Activity,   color: "purple" },
    { label: "Milestones Hit",      value: kpis.milestones,     sub: "this month",           icon: Award,      color: "amber"  },
  ];

  const displayAdherence = adherence.length > 0
    ? adherence
    : PATIENTS.map(p => ({ name: p.name, adherence: p.adherence, sessions: p.sessions }));

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-8 pb-12">

      {/* Header */}
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>Analytics</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>Cohort-level outcomes across all your active patients.</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["2w", "4w", "6w", "3m"].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: "8px 16px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${range === r ? "var(--secondary)" : "var(--border)"}`,
              background: range === r ? "var(--secondary-light)" : "transparent",
              color: range === r ? "var(--secondary)" : "var(--text-3)", transition: "all 0.15s",
            }}>{r}</button>
          ))}
        </div>
      </section>

      {/* KPI Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {kpiCards.map(({ label, value, sub, icon: Icon, color }) => {
          const p = {
            blue:   { bg: "var(--primary-light)",   ic: "var(--primary)",   border: "rgba(26,110,189,0.18)" },
            green:  { bg: "var(--accent-light)",    ic: "var(--accent)",    border: "rgba(14,168,116,0.18)" },
            amber:  { bg: "var(--warn-light)",      ic: "var(--warn)",      border: "rgba(232,147,10,0.18)" },
            purple: { bg: "var(--secondary-light)", ic: "var(--secondary)", border: "rgba(91,110,245,0.18)" },
          }[color]!;
          return (
            <div key={label} style={{ background: "#fff", border: `1px solid ${p.border}`, borderRadius: "var(--r-xl)", padding: "22px 20px", boxShadow: "var(--shadow-card)", transition: "all 0.22s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-hover)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 16, height: 16, color: p.ic }} />
                </div>
              </div>
              {loading ? <Skeleton h={36} w="60%" /> : (
                <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, color: "var(--text-1)", lineHeight: 1, marginBottom: 6 }}>{value}</div>
              )}
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{sub}</div>
            </div>
          );
        })}
      </section>

      {/* ROM Trend + Weekly Sessions */}
      <section style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 24 }}>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>ROM Progress (Cohort Avg)</h3>
          <div style={{ height: 280 }}>
            {loading ? <Skeleton h={280} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={romTrend} margin={{ left: -20, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Line type="monotone" dataKey="avg" stroke="#5B6EF5" strokeWidth={2.5} dot={{ r: 4 }} name="Cohort Avg ROM" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar style={{ width: 16, height: 16, color: "var(--primary)" }} /> Sessions This Week
          </h3>
          <div style={{ height: 280 }}>
            {loading ? <Skeleton h={280} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBars} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="sessions" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Adherence + Pain Trend */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>Adherence by Patient</h3>
          <div style={{ height: 260 }}>
            {loading ? <Skeleton h={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayAdherence} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#7A94AD", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#3D5166", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v ?? 0)}%`, "Adherence"]} />
                  <ReferenceLine x={90} stroke="var(--accent)" strokeDasharray="4 2" strokeWidth={1.5} />
                  <Bar dataKey="adherence" radius={[0, 6, 6, 0]} fill="var(--primary)"
                    label={{ position: "right", fontSize: 11, fill: "var(--text-3)", formatter: (v) => `${Number(v ?? 0)}%` }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>Cohort Avg Pain Trend</h3>
          <div style={{ height: 260 }}>
            {loading ? <Skeleton h={260} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={painTrend} margin={{ left: -20, right: 16, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#D94040" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#D94040" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v ?? 0)}/10`, "Avg Pain"]} />
                  <ReferenceLine y={4} stroke="var(--warn)" strokeDasharray="4 2" strokeWidth={1} label={{ value: "Moderate", fill: "var(--warn)", fontSize: 10 }} />
                  <Area type="monotone" dataKey="avg" stroke="var(--danger)" strokeWidth={2.5} fill="url(#painGrad)"
                    dot={{ fill: "var(--danger)", r: 4, strokeWidth: 0 }} activeDot={{ r: 5, fill: "var(--danger)", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Radar + Leaderboard */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>Cohort Outcome Radar</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#EDF2F7" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#7A94AD", fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v ?? 0)}%`, "Score"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 style={{ width: 16, height: 16, color: "var(--secondary)" }} /> Adherence Leaderboard
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loading ? [1,2,3,4].map(i => <Skeleton key={i} h={44} />) :
              [...displayAdherence].sort((a, b) => b.adherence - a.adherence).map((p, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
                const color = p.adherence >= 90 ? "var(--accent)" : p.adherence >= 75 ? "var(--primary)" : "var(--warn)";
                return (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: "var(--r-md)", background: i === 0 ? "var(--accent-light)" : "var(--bg-subtle)", border: `1px solid ${i === 0 ? "rgba(14,168,116,0.2)" : "var(--border)"}` }}>
                    <span style={{ fontSize: 16, minWidth: 24 }}>{medal}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{p.sessions} sessions</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#EDF2F7", borderRadius: 9999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p.adherence}%`, background: color, borderRadius: 9999 }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 13, fontWeight: 700, color, minWidth: 36 }}>{p.adherence}%</span>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </section>
    </div>
  );
}
