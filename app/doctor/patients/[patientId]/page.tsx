"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, TrendingUp, TrendingDown,
  Minus, Activity, AlertTriangle, CheckCircle2,
  Clock, Target, MessageCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { PATIENTS, statusConfig, getMockSessions } from "../data";

// ── Helpers ────────────────────────────────────────────────────────────────
function painColor(v: number) {
  if (v <= 3) return "var(--accent)";
  if (v <= 6) return "var(--warn)";
  return "var(--danger)";
}

function TrendIcon({ trend }: { trend: "up" | "flat" | "down" }) {
  if (trend === "up")   return <TrendingUp   style={{ width: 14, height: 14, color: "var(--accent)" }} />;
  if (trend === "down") return <TrendingDown style={{ width: 14, height: 14, color: "var(--danger)" }} />;
  return <Minus style={{ width: 14, height: 14, color: "var(--text-3)" }} />;
}

function RomBar({ value, target }: { value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const color = pct >= 90 ? "var(--accent)" : pct >= 65 ? "var(--primary)" : "var(--warn)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: "var(--text-3)" }}>ROM Progress</span>
        <span style={{ fontFamily: "var(--font-data)", fontWeight: 700, color: "var(--text-1)" }}>
          {value}° / {target}° ({pct}%)
        </span>
      </div>
      <div style={{ height: 10, background: "#EDF2F7", borderRadius: 5, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 5,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          transition: "width 0.8s var(--ease-out)",
        }} />
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#fff", borderColor: "var(--border)",
  borderRadius: "8px", color: "var(--text-1)", boxShadow: "var(--shadow-md)",
};

// ── Page ───────────────────────────────────────────────────────────────────
export default function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const patient = PATIENTS.find(p => p.id === patientId);
  const sessions = useMemo(() => getMockSessions(patientId), [patientId]);

  // 404-style fallback
  if (!patient) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-1)" }}>
          Patient not found
        </h2>
        <p style={{ color: "var(--text-3)", fontSize: 14 }}>ID &quot;{patientId}&quot; doesn&apos;t match any patient.</p>
        <Link href="/doctor/patients" className="btn-primary" style={{ padding: "10px 24px", fontSize: 14 }}>
          ← Back to Patients
        </Link>
      </div>
    );
  }

  const st = statusConfig[patient.status];
  const romData = sessions.map(s => ({ date: s.date, rom: s.rom, target: patient.romTarget }));
  const painData = sessions.map(s => ({ date: s.date, pain: s.pain }));
  const adherencePct = patient.adherence;
  const adherenceColor = adherencePct >= 85 ? "var(--accent)" : adherencePct >= 65 ? "var(--warn)" : "var(--danger)";

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-8 pb-12">

      {/* ── Back + Header ── */}
      <section>
        <Link
          href="/doctor/patients"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "var(--text-3)", textDecoration: "none",
            marginBottom: 20, transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Patients
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          {/* Patient identity */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, var(--secondary-light), var(--primary-light))",
              border: "3px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--secondary)",
            }}>
              {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text-1)" }}>
                  {patient.name}
                </h1>
                <span style={{ background: st.bg, color: st.color, padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>
                  {st.label}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
                Age {patient.age} · {patient.gender === "M" ? "Male" : "Female"} · {patient.injury}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                <a href={`tel:${patient.phone}`} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-3)", textDecoration: "none" }}>
                  <Phone style={{ width: 12, height: 12 }} /> {patient.phone}
                </a>
                <a href={`mailto:${patient.email}`} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-3)", textDecoration: "none" }}>
                  <Mail style={{ width: 12, height: 12 }} /> {patient.email}
                </a>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: "var(--r-full)",
              border: "1px solid var(--border)", background: "transparent",
              fontSize: 13, fontWeight: 600, color: "var(--text-2)", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <MessageCircle style={{ width: 14, height: 14 }} /> Message
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: "var(--r-full)",
              border: "none", background: "var(--secondary)", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(91,110,245,0.30)", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(91,110,245,0.40)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(91,110,245,0.30)"; }}
            >
              ✏️ Edit Protocol
            </button>
          </div>
        </div>
      </section>

      {/* ── KPI Cards ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { icon: <Activity style={{ width: 18, height: 18 }} />, label: "Total Sessions", value: patient.sessions, color: "blue" as const },
          { icon: <Target style={{ width: 18, height: 18 }} />, label: "Best ROM", value: `${patient.rom}°`, color: "green" as const },
          { icon: <Clock style={{ width: 18, height: 18 }} />, label: "Recovery Week", value: `W${patient.week}/${patient.totalWeeks}`, color: "purple" as const },
          { icon: <AlertTriangle style={{ width: 18, height: 18 }} />, label: "Pain Score", value: `${patient.pain}/10`, color: "amber" as const },
        ].map(({ icon, label, value, color }) => {
          const colorMap = {
            blue:   { bg: "var(--primary-light)",   ic: "var(--primary)",   border: "rgba(26,110,189,0.15)" },
            green:  { bg: "var(--accent-light)",    ic: "var(--accent)",    border: "rgba(14,168,116,0.15)" },
            amber:  { bg: "var(--warn-light)",      ic: "var(--warn)",      border: "rgba(232,147,10,0.15)" },
            purple: { bg: "var(--secondary-light)", ic: "var(--secondary)", border: "rgba(91,110,245,0.15)" },
          };
          const c = colorMap[color];
          return (
            <div key={label} style={{
              background: "#fff", border: `1px solid ${c.border}`,
              borderRadius: "var(--r-xl)", padding: "20px",
              boxShadow: "var(--shadow-card)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)" }}>{label}</span>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.ic }}>
                  {icon}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>{value}</div>
            </div>
          );
        })}
      </section>

      {/* ── AI Summary + Adherence ── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* AI Summary */}
        <div style={{
          background: "linear-gradient(135deg, var(--primary-light) 0%, var(--accent-light) 100%)",
          border: "1px solid var(--primary-mid)", borderRadius: "var(--r-xl)",
          padding: 24, boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Gemini AI Summary</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>{patient.aiSummary}</p>
          <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {patient.tags.map(tag => (
              <span key={tag} className="badge badge-blue" style={{ fontSize: 11 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Adherence + ROM bar */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>
            Compliance Overview
          </h3>

          {/* Adherence ring */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
              <svg width={72} height={72} viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                <circle cx={36} cy={36} r={28} fill="none" stroke="#EDF2F7" strokeWidth={7} />
                <circle cx={36} cy={36} r={28} fill="none" stroke={adherenceColor} strokeWidth={7}
                  strokeDasharray={`${(adherencePct / 100) * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-data)", fontSize: 14, fontWeight: 800, color: "var(--text-1)" }}>
                {adherencePct}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Adherence Rate</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{patient.sessions} sessions · {patient.missedDays} missed days</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Last active: {patient.lastSession}</div>
            </div>
          </div>

          <RomBar value={patient.rom} target={patient.romTarget} />

          {/* Trend */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: "var(--r-md)" }}>
            <TrendIcon trend={patient.trend} />
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>
              ROM trend: <strong>{patient.trend === "up" ? "Improving" : patient.trend === "down" ? "Declining" : "Stable"}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ── ROM Chart ── */}
      <section style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>
          ROM Progress (Last 10 Sessions)
        </h3>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={romData} margin={{ left: -20, right: 16, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="romGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A6EBD" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A6EBD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7A94AD", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={patient.romTarget} stroke="var(--accent)" strokeDasharray="6 3" strokeWidth={1.5}
                label={{ value: `Target ${patient.romTarget}°`, fill: "var(--accent)", fontSize: 11 }} />
              <Area type="monotone" dataKey="rom" stroke="#1A6EBD" strokeWidth={2.5}
                fill="url(#romGrad2)"
                dot={{ fill: "#1A6EBD", r: 3.5, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#1A6EBD", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Pain Trend + Session History ── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Pain Trend */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>
            Pain Trend
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={painData} margin={{ left: -20, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 2" stroke="#EDF2F7" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#7A94AD", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: "#7A94AD", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="pain" stroke="var(--danger)" strokeWidth={2}
                  dot={props => <circle cx={props.cx} cy={props.cy} r={4}
                    fill={painColor(Number(props.payload.pain))} stroke="#fff" strokeWidth={2} />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session History */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>
            Recent Sessions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {sessions.slice(0, 6).map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: i < 5 ? "1px solid #F0F4F8" : "none",
                transition: "background 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: s.status === "COMPLETED" ? "var(--accent-light)" : "var(--warn-light)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {s.status === "COMPLETED"
                      ? <CheckCircle2 style={{ width: 14, height: 14, color: "var(--accent)" }} />
                      : <AlertTriangle style={{ width: 14, height: 14, color: "var(--warn)" }} />
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{s.date}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.reps} reps</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 14, color: "var(--primary)", fontWeight: 600 }}>{s.rom}°</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 13, color: painColor(s.pain), fontWeight: 600 }}>{s.pain}/10</span>
                  <span className={`badge ${s.status === "COMPLETED" ? "badge-green" : "badge-amber"}`} style={{ fontSize: 10 }}>
                    {s.status === "COMPLETED" ? "Done" : "Abandoned"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctor Notes ── */}
      <section style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>
          Clinical Notes
        </h3>
        <textarea
          placeholder="Add a clinical note for this patient..."
          rows={4}
          style={{
            width: "100%", background: "var(--bg-input)", border: "1.5px solid var(--border)",
            borderRadius: "var(--r-md)", padding: "12px 14px", fontSize: 14,
            color: "var(--text-1)", resize: "vertical", outline: "none",
            fontFamily: "var(--font-body)", lineHeight: 1.6,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,110,189,0.12)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>
            Save Note
          </button>
        </div>
      </section>

    </div>
  );
}
