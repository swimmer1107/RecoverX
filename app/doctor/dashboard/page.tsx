"use client";

import { useState, useEffect } from "react";
import { getUser } from "../../lib/auth";
import Link from "next/link";
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, ChevronRight, Activity, Calendar,
  Flame, FileText, MessageCircle, ArrowUpRight, KeyRound, Save, Download, Eye,
} from "lucide-react";

/* ── Dummy data ─────────────────────────────────────────────────────── */
const PATIENTS = [
  { id: "p1", name: "Arjun Sharma",   age: 34, injury: "ACL Tear – Post-op W3",   rom: 82,  romTarget: 120, pain: 3, adherence: 92, trend: "up",   status: "on-track",  lastSeen: "Today" },
  { id: "p2", name: "Meera Iyer",     age: 52, injury: "TKR – Post-op W6",         rom: 68,  romTarget: 90,  pain: 5, adherence: 74, trend: "flat", status: "attention", lastSeen: "2d ago" },
  { id: "p3", name: "Rahul Verma",    age: 28, injury: "Rotator Cuff – W9",        rom: 95,  romTarget: 100, pain: 1, adherence: 98, trend: "up",   status: "excellent", lastSeen: "Today" },
  { id: "p4", name: "Sunita Pillai",  age: 61, injury: "Hip Replacement – W2",     rom: 40,  romTarget: 80,  pain: 7, adherence: 58, trend: "down", status: "at-risk",   lastSeen: "5d ago" },
  { id: "p5", name: "Karan Mehta",    age: 22, injury: "Patellar Tendon – W4",     rom: 88,  romTarget: 110, pain: 2, adherence: 87, trend: "up",   status: "on-track",  lastSeen: "1d ago" },
];

const ALERTS = [
  { type: "danger",  patient: "Sunita Pillai",  msg: "5-day missed sessions + pain score 7/10", time: "Now" },
  { type: "warning", patient: "Meera Iyer",     msg: "Adherence dropped below 75% this week",   time: "2h ago" },
  { type: "info",    patient: "Rahul Verma",     msg: "ROM milestone reached — 95° achieved",   time: "3h ago" },
];

const APPOINTMENTS = [
  { time: "09:00", patient: "Arjun Sharma",  type: "Follow-up Review",  duration: "20 min" },
  { time: "10:30", patient: "Sunita Pillai", type: "Pain Assessment",    duration: "30 min" },
  { time: "12:00", patient: "Meera Iyer",    type: "Protocol Adjustment",duration: "20 min" },
  { time: "14:00", patient: "Karan Mehta",   type: "Progress Check",     duration: "15 min" },
];

const ACCESS_REPORT = {
  fileName: "recovery-progress-report.pdf",
  date: "May 21, 2026",
  liveStatus: "Available",
  summary: "ROM improved from 45° to 82°. Pain is stable at 4/10. Sessions completed consistently this week.",
};

const ACCESS_EXERCISES = [
  { name: "Heel Slides", bestAngle: "82°", sessions: 8 },
  { name: "Straight Leg Raise", bestAngle: "18°", sessions: 5 },
  { name: "Quad Sets", bestAngle: "Complete", sessions: 6 },
];

const ACCESS_SESSIONS = [
  { date: "May 21", exercise: "Heel Slides", result: "82°", reps: "10/10", status: "Completed" },
  { date: "May 20", exercise: "Straight Leg Raise", result: "18°", reps: "8/10", status: "Completed" },
  { date: "May 19", exercise: "Heel Slides", result: "80°", reps: "10/10", status: "Completed" },
];

type LinkedPatient = {
  name: string;
  code: string;
  surgeryType: string;
  week: string;
};

function normalizeAccessCode(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function formatAccessCode(value: string) {
  const raw = normalizeAccessCode(value).slice(0, 6);
  return raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw;
}

function readPatientProfile() {
  try {
    const saved = window.localStorage.getItem("antigravity-profile");
    if (!saved) return null;
    const profile = JSON.parse(saved) as { fullName?: string; surgeryType?: string; currentWeek?: string | number };
    return {
      name: profile.fullName || "Patient",
      surgeryType: profile.surgeryType || "Recovery Program",
      week: String(profile.currentWeek || "1"),
    };
  } catch {
    return null;
  }
}

function readSavedPatients(): LinkedPatient[] {
  try {
    const saved = window.localStorage.getItem("antigravity-saved-patients");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildAccessReportPdf(patient: LinkedPatient) {
  const lines = [
    "AntiGravity Recovery Report",
    `Patient: ${patient.name}`,
    `Program: ${patient.surgeryType}`,
    `Recovery Week: ${patient.week}`,
    `Report Date: ${ACCESS_REPORT.date}`,
    "",
    "Summary",
    ACCESS_REPORT.summary,
    "",
    "Exercises Completed",
    ...ACCESS_EXERCISES.map(exercise => `${exercise.name}: ${exercise.sessions} sessions, best ${exercise.bestAngle}`),
    "",
    "Recent Sessions",
    ...ACCESS_SESSIONS.map(session => `${session.date}: ${session.exercise}, ${session.result}, ${session.reps}, ${session.status}`),
  ];

  const textOps = lines.map((line, index) => {
    const y = 760 - index * 20;
    const size = index === 0 ? 18 : line === "Summary" || line === "Exercises Completed" || line === "Recent Sessions" ? 13 : 10;
    return `BT /F1 ${size} Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
  }).join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${textOps.length} >>\nstream\n${textOps}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

/* ── Sub-components ──────────────────────────────────────────────────── */
function SummaryCard({
  icon: Icon, label, value, sub, color, href,
}: {
  icon: React.ElementType; label: string; value: string; sub: string;
  color: "blue" | "green" | "amber" | "danger" | "purple"; href?: string;
}) {
  const palette = {
    blue:   { bg: "var(--primary-light)",   icon: "var(--primary)",   border: "rgba(26,110,189,0.18)" },
    green:  { bg: "var(--accent-light)",    icon: "var(--accent)",    border: "rgba(14,168,116,0.18)" },
    amber:  { bg: "var(--warn-light)",      icon: "var(--warn)",      border: "rgba(232,147,10,0.18)" },
    danger: { bg: "var(--danger-light)",    icon: "var(--danger)",    border: "rgba(217,64,64,0.18)" },
    purple: { bg: "var(--secondary-light)", icon: "var(--secondary)", border: "rgba(91,110,245,0.18)" },
  };
  const p = palette[color];
  const Wrapper = href ? Link : "div";

  return (
    <Wrapper
      href={href ?? "#"}
      style={{
        background: "#fff",
        border: `1px solid ${p.border}`,
        borderRadius: "var(--r-xl)",
        padding: "22px 20px",
        boxShadow: "var(--shadow-card)",
        display: "block",
        textDecoration: "none",
        transition: "all 0.22s",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-hover)";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>
          {label}
        </span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon style={{ width: 16, height: 16, color: p.icon }} />
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "var(--text-1)", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{sub}</div>
    </Wrapper>
  );
}

function RomBar({ value, target }: { value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const color = pct >= 90 ? "var(--accent)" : pct >= 65 ? "var(--primary)" : "var(--warn)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "var(--bg-subtle)", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 9999, transition: "width 0.6s" }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "var(--font-data)", color: "var(--text-3)", minWidth: 36 }}>
        {value}°
      </span>
    </div>
  );
}

const statusStyle: Record<string, { label: string; bg: string; color: string }> = {
  excellent: { label: "Excellent",  bg: "var(--accent-light)",    color: "var(--accent-dark)" },
  "on-track":{ label: "On Track",   bg: "var(--primary-light)",   color: "var(--primary)" },
  attention: { label: "Attention",  bg: "var(--warn-light)",      color: "var(--warn)" },
  "at-risk": { label: "At Risk",    bg: "var(--danger-light)",    color: "var(--danger)" },
};

/* ── Main page ───────────────────────────────────────────────────────── */
export default function DoctorDashboard() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [doctorName, setDoctorName] = useState("Dr. Nair");
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [linkedPatient, setLinkedPatient] = useState<LinkedPatient | null>(null);
  const [savedPatients, setSavedPatients] = useState<LinkedPatient[]>([]);
  const [showLiveReport, setShowLiveReport] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user?.name) {
      setDoctorName(user.name);
    }
    setSavedPatients(readSavedPatients());
  }, []);

  const filtered = selectedFilter === "all"
    ? PATIENTS
    : PATIENTS.filter(p => p.status === selectedFilter);

  const atRisk    = PATIENTS.filter(p => p.status === "at-risk").length;
  const attention = PATIENTS.filter(p => p.status === "attention").length;
  const onTrack   = PATIENTS.filter(p => ["on-track", "excellent"].includes(p.status)).length;
  const avgAdherence = Math.round(PATIENTS.reduce((s, p) => s + p.adherence, 0) / PATIENTS.length);
  const linkedPatientSaved = linkedPatient
    ? savedPatients.some(patient => normalizeAccessCode(patient.code) === normalizeAccessCode(linkedPatient.code))
    : false;

  function handleAccessSubmit() {
    const entered = normalizeAccessCode(accessCode);
    const stored = normalizeAccessCode(window.localStorage.getItem("antigravity-access-code") || "");
    if (!entered || entered !== stored) {
      setLinkedPatient(null);
      setAccessError("Code not found. Ask your patient to share the correct access code.");
      return;
    }

    const profile = readPatientProfile();
    if (!profile) {
      setLinkedPatient(null);
      setAccessError("No report data is available for this access code.");
      return;
    }

    setAccessError("");
    setShowLiveReport(false);
    setLinkedPatient({ ...profile, code: formatAccessCode(accessCode) });
  }

  function handleSaveLinkedPatient() {
    if (!linkedPatient || linkedPatientSaved) return;
    const next = [...savedPatients, linkedPatient];
    window.localStorage.setItem("antigravity-saved-patients", JSON.stringify(next));
    setSavedPatients(next);
  }

  function handleDownloadAccessReport() {
    if (!linkedPatient) return;
    const url = URL.createObjectURL(new Blob([buildAccessReportPdf(linkedPatient)], { type: "application/pdf" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = ACCESS_REPORT.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-8 pb-12">

      {/* ── Welcome Banner ── */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--secondary-light) 0%, rgba(26,110,189,0.06) 100%)",
          border: "1px solid rgba(91,110,245,0.15)",
          borderRadius: "var(--r-xl)",
          padding: "24px 28px",
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", opacity: 0.07 }}>
          <Activity style={{ width: 96, height: 96, color: "var(--secondary)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
            Good morning, {doctorName} 👋
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>
            You have <strong>{APPOINTMENTS.length} appointments</strong> today and{" "}
            <strong style={{ color: "var(--danger)" }}>{atRisk} patient{atRisk !== 1 ? "s" : ""} at risk</strong> requiring immediate review.
          </p>
        </div>
      </section>

      {/* ── Summary Cards ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        <SummaryCard icon={Users}        label="Active Patients"  value={String(PATIENTS.length)} sub="Under care"           color="blue"   href="/doctor/patients" />
        <SummaryCard icon={CheckCircle2} label="On Track"         value={String(onTrack)}         sub="meeting ROM targets"  color="green"  />
        <SummaryCard icon={AlertTriangle}label="Need Attention"   value={String(atRisk + attention)} sub="review recommended" color="amber"  />
        <SummaryCard icon={TrendingUp}   label="Avg Adherence"    value={`${avgAdherence}%`}      sub="across all patients"  color="purple" />
      </section>

      {/* ── Main Grid: Patient Table + Right Column ── */}
      <section style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: 24, alignItems: "start" }}>

        {/* Patient Table */}
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>
              Patient Roster
            </h3>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "excellent", "on-track", "attention", "at-risk"].map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  style={{
                    padding: "4px 12px", borderRadius: "var(--r-full)", fontSize: 11,
                    fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                    border: `1px solid ${selectedFilter === f ? "var(--primary)" : "var(--border)"}`,
                    background: selectedFilter === f ? "var(--primary-light)" : "transparent",
                    color: selectedFilter === f ? "var(--primary)" : "var(--text-3)",
                    transition: "all 0.15s",
                  }}
                >
                  {f === "all" ? "All" : f.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Patient", "Condition", "ROM", "Pain", "Adherence", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "0 14px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const st = statusStyle[p.status];
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: "1px solid #F0F4F8", transition: "background 0.15s", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--secondary-light), var(--primary-light))",
                          border: "1px solid var(--border)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, color: "var(--secondary)", flexShrink: 0,
                        }}>
                          {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)" }}>Age {p.age} · {p.lastSeen}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px", fontSize: 13, color: "var(--text-2)" }}>
                      {p.injury}
                    </td>
                    <td style={{ padding: "14px", minWidth: 120 }}>
                      <RomBar value={p.rom} target={p.romTarget} />
                    </td>
                    <td style={{ padding: "14px", fontFamily: "var(--font-data)", fontSize: 14, color: p.pain >= 6 ? "var(--danger)" : p.pain >= 4 ? "var(--warn)" : "var(--accent)" }}>
                      {p.pain}/10
                    </td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 4, background: "var(--bg-subtle)", borderRadius: 9999, overflow: "hidden", maxWidth: 60 }}>
                          <div style={{
                            height: "100%", width: `${p.adherence}%`,
                            background: p.adherence >= 85 ? "var(--accent)" : p.adherence >= 70 ? "var(--primary)" : "var(--warn)",
                            borderRadius: 9999,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontFamily: "var(--font-data)", color: "var(--text-2)" }}>{p.adherence}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <Link
                        href={`/doctor/patients/${p.id}`}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-3)", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--text-3)"; }}
                      >
                        <ChevronRight style={{ width: 13, height: 13 }} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Link href="/doctor/patients" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              View full directory <ArrowUpRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Patient Access Code */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 20, boxShadow: "var(--shadow-card)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <KeyRound style={{ width: 15, height: 15, color: "var(--secondary)" }} />
              Patient Access Code
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14 }}>
              Enter the code shared by your patient to view their progress.
            </p>

            <input
              value={accessCode}
              onChange={e => {
                setAccessCode(formatAccessCode(e.target.value));
                setAccessError("");
              }}
              onKeyDown={e => {
                if (e.key === "Enter") handleAccessSubmit();
              }}
              maxLength={7}
              placeholder="XXX-XXX"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                background: "var(--bg-input)",
                color: "var(--secondary)",
                fontFamily: "var(--font-data)",
                fontSize: 20,
                letterSpacing: "0.16em",
                textAlign: "center",
                outline: "none",
                textTransform: "uppercase",
              }}
            />

            {accessError && (
              <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: "var(--r-sm)", background: "var(--danger-light)", color: "var(--danger)", fontSize: 12, fontWeight: 600 }}>
                {accessError}
              </div>
            )}

            <button onClick={handleAccessSubmit} className="btn-primary" style={{ width: "100%", padding: "10px 16px", fontSize: 13, marginTop: 12, background: "var(--secondary)" }}>
              View Patient
            </button>

            {linkedPatient && (
              <div style={{ marginTop: 14, padding: "12px", borderRadius: "var(--r-md)", background: "var(--secondary-light)", border: "1px solid rgba(91,110,245,0.18)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Shared recovery report</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{linkedPatient.name} · {linkedPatient.surgeryType}</div>
                  </div>
                  <span className="badge badge-blue" style={{ flexShrink: 0 }}>W{linkedPatient.week}</span>
                </div>

                <div style={{ marginTop: 12, padding: "10px", borderRadius: "var(--r-sm)", background: "#fff", border: "1px solid rgba(91,110,245,0.18)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <FileText style={{ width: 14, height: 14, color: "var(--secondary)" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>{ACCESS_REPORT.fileName}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>{ACCESS_REPORT.summary}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => setShowLiveReport(prev => !prev)} style={{ flex: 1, padding: "7px 8px", borderRadius: "var(--r-full)", background: showLiveReport ? "var(--secondary)" : "#fff", border: "1px solid var(--border)", color: showLiveReport ? "#fff" : "var(--secondary)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Eye style={{ width: 12, height: 12 }} />
                      Live Report
                    </button>
                    <button onClick={handleDownloadAccessReport} style={{ flex: 1, padding: "7px 8px", borderRadius: "var(--r-full)", background: "#fff", border: "1px solid var(--border)", color: "var(--secondary)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Download style={{ width: 12, height: 12 }} />
                      PDF
                    </button>
                  </div>
                </div>

                {showLiveReport && (
                  <div style={{ marginTop: 10, padding: "10px", borderRadius: "var(--r-sm)", background: "#fff", border: "1px solid rgba(91,110,245,0.18)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                      Live Recovery Report
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      {[
                        ["Best ROM", "82°"],
                        ["Pain Score", "4/10"],
                        ["Sessions", "19"],
                        ["Report Date", ACCESS_REPORT.date],
                      ].map(([label, value]) => (
                        <div key={label} style={{ padding: "8px", borderRadius: "var(--r-sm)", background: "var(--bg-subtle)" }}>
                          <div style={{ fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
                          <div style={{ marginTop: 2, fontSize: 12, fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-data)" }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.6 }}>
                      The patient is progressing steadily with consistent attendance. Current ROM is approaching the 90° target and pain remains moderate without red-flag escalation.
                    </p>
                  </div>
                )}

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                    Exercises Completed
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ACCESS_EXERCISES.map(exercise => (
                      <div key={exercise.name} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 8px", borderRadius: "var(--r-sm)", background: "#fff", border: "1px solid rgba(91,110,245,0.12)" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-1)" }}>{exercise.name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-data)" }}>{exercise.sessions} sessions · {exercise.bestAngle}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                    Recent Sessions Attended
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ACCESS_SESSIONS.map(session => (
                      <div key={`${session.date}-${session.exercise}`} style={{ padding: "7px 8px", borderRadius: "var(--r-sm)", background: "#fff", border: "1px solid rgba(91,110,245,0.12)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-1)" }}>{session.exercise}</span>
                          <span className="badge badge-green" style={{ fontSize: 9 }}>{session.status}</span>
                        </div>
                        <div style={{ marginTop: 3, fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-data)" }}>{session.date} · {session.result} · {session.reps} reps</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={handleSaveLinkedPatient}
                    disabled={linkedPatientSaved}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: "var(--r-full)", border: "none", background: linkedPatientSaved ? "var(--accent-light)" : "var(--secondary)", color: linkedPatientSaved ? "var(--accent)" : "#fff", fontSize: 12, fontWeight: 600, cursor: linkedPatientSaved ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    <Save style={{ width: 12, height: 12 }} />
                    {linkedPatientSaved ? "Saved for tracking" : "Save for tracking"}
                  </button>
                </div>
              </div>
            )}

            {savedPatients.length > 0 && (
              <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                  Saved Patients
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {savedPatients.map(patient => (
                    <button
                      key={patient.code}
                      onClick={() => {
                        setLinkedPatient(patient);
                        setAccessCode(patient.code);
                        setAccessError("");
                      }}
                      style={{ textAlign: "left", padding: "8px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg-subtle)", cursor: "pointer" }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>{patient.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>{patient.surgeryType} · W{patient.week}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alerts */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 20, boxShadow: "var(--shadow-card)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle style={{ width: 15, height: 15, color: "var(--warn)" }} />
              Clinical Alerts
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ALERTS.map((a, i) => {
                const alertStyle = {
                  danger:  { bg: "var(--danger-light)",  border: "#FFBEBE", dot: "var(--danger)" },
                  warning: { bg: "var(--warn-light)",    border: "#FFD59E", dot: "var(--warn)" },
                  info:    { bg: "var(--primary-light)", border: "var(--primary-mid)", dot: "var(--primary)" },
                }[a.type] || { bg: "var(--primary-light)", border: "var(--primary-mid)", dot: "var(--primary)" };
                return (
                  <div key={i} style={{ background: alertStyle.bg, border: `1px solid ${alertStyle.border}`, borderRadius: "var(--r-md)", padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: alertStyle.dot, display: "inline-block", flexShrink: 0 }} />
                        {a.patient}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-data)" }}>{a.time}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-2)", paddingLeft: 12 }}>{a.msg}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Appointments */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 20, boxShadow: "var(--shadow-card)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar style={{ width: 15, height: 15, color: "var(--primary)" }} />
              Today&apos;s Schedule
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {APPOINTMENTS.map((appt, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: "var(--r-md)",
                    border: "1px solid var(--border)", background: "var(--bg-subtle)",
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                >
                  <span style={{ fontSize: 12, fontFamily: "var(--font-data)", color: "var(--primary)", fontWeight: 600, minWidth: 38 }}>
                    {appt.time}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {appt.patient}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{appt.type} · {appt.duration}</div>
                  </div>
                  <Clock style={{ width: 13, height: 13, color: "var(--text-4)", flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: "linear-gradient(135deg, var(--secondary-light), rgba(26,110,189,0.05))", border: "1px solid rgba(91,110,245,0.18)", borderRadius: "var(--r-xl)", padding: 20, boxShadow: "var(--shadow-card)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 14 }}>
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Assign New Protocol",  icon: FileText,        href: "/doctor/prescriptions" },
                { label: "Send Patient Message", icon: MessageCircle,    href: "/doctor/messages" },
                { label: "View Analytics",       icon: TrendingUp,       href: "/doctor/analytics" },
                { label: "Streak Review",        icon: Flame,            href: "/doctor/patients" },
              ].map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: "var(--r-md)",
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(91,110,245,0.12)",
                    color: "var(--secondary)", fontSize: 13, fontWeight: 500,
                    textDecoration: "none", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.7)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <Icon style={{ width: 14, height: 14 }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
