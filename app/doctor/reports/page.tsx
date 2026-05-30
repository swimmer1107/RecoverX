"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText, Download, Search, Filter,
  CheckCircle2, Clock, AlertTriangle, Eye,
  ChevronRight, Plus, Stethoscope, Activity,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────── */
type ReportStatus = "reviewed" | "pending" | "flagged";
type NoteType = "progress" | "concern" | "milestone";

type PatientReport = {
  id: string;
  patientId: string;
  patientName: string;
  injury: string;
  week: number;
  reportDate: string;
  fileName: string;
  status: ReportStatus;
  extractedSurgery: string;
  extractedROM: string;
  extractedRestrictions: string[];
  aiSummary: string;
};

type ClinicalNote = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: NoteType;
  note: string;
  author: string;
};


/* ── Mock data ──────────────────────────────────────────────────────── */
const REPORTS: PatientReport[] = [
  {
    id: "r1", patientId: "p1", patientName: "Arjun Sharma",
    injury: "ACL Tear – Post-op", week: 3,
    reportDate: "May 8, 2026", fileName: "arjun-discharge-summary.pdf",
    status: "reviewed",
    extractedSurgery: "ACL Reconstruction – Right Knee",
    extractedROM: "Target: 120° by Week 8",
    extractedRestrictions: ["No pivoting for 6 weeks", "Weight-bearing as tolerated"],
    aiSummary: "Discharge letter processed. 4 exercises extracted. ROM target 120°. No red flags.",
  },
  {
    id: "r2", patientId: "p2", patientName: "Meera Iyer",
    injury: "Total Knee Replacement", week: 6,
    reportDate: "Apr 20, 2026", fileName: "meera-tkr-report.pdf",
    status: "flagged",
    extractedSurgery: "Total Knee Replacement – Left Knee",
    extractedROM: "Target: 90° by Week 8",
    extractedRestrictions: ["No deep squats", "Avoid twisting", "Keep incision dry"],
    aiSummary: "⚠️ Pain persisting at 5/10 despite W6 protocol. ROM below target. Recommend review.",
  },
  {
    id: "r3", patientId: "p3", patientName: "Rahul Verma",
    injury: "Rotator Cuff Repair", week: 9,
    reportDate: "Mar 12, 2026", fileName: "rahul-rotator-cuff.jpg",
    status: "reviewed",
    extractedSurgery: "Rotator Cuff Repair – Right Shoulder",
    extractedROM: "Target: 100° elevation by Week 10",
    extractedRestrictions: ["No overhead lifting > 2kg until W8"],
    aiSummary: "Excellent progress. ROM at 95% of target. On track for early discharge.",
  },
  {
    id: "r4", patientId: "p4", patientName: "Sunita Pillai",
    injury: "Hip Replacement", week: 2,
    reportDate: "May 25, 2026", fileName: "sunita-hip-discharge.pdf",
    status: "pending",
    extractedSurgery: "Total Hip Replacement – Right Hip",
    extractedROM: "Target: 80° flexion by Week 6",
    extractedRestrictions: ["No flexion > 90°", "No internal rotation", "Use raised toilet seat"],
    aiSummary: "Report uploaded but not yet reviewed. Patient at risk — 5 missed sessions.",
  },
  {
    id: "r5", patientId: "p5", patientName: "Karan Mehta",
    injury: "Patellar Tendon Repair", week: 4,
    reportDate: "May 5, 2026", fileName: "karan-patellar.pdf",
    status: "reviewed",
    extractedSurgery: "Patellar Tendon Repair – Left Knee",
    extractedROM: "Target: 110° by Week 10",
    extractedRestrictions: ["No running until W8", "Avoid stairs for 2 weeks"],
    aiSummary: "Good adherence. Minor ROM plateau — consider increasing flexion load.",
  },
  {
    id: "r6", patientId: "p6", patientName: "Deepa Krishnan",
    injury: "Shoulder Impingement", week: 5,
    reportDate: "Apr 28, 2026", fileName: "deepa-shoulder.pdf",
    status: "reviewed",
    extractedSurgery: "Shoulder Impingement Decompression – Left",
    extractedROM: "Target: 120° elevation by Week 8",
    extractedRestrictions: ["No overhead work for 3 weeks"],
    aiSummary: "Exceptional compliance. ROM at 92% of target. Expected early discharge.",
  },
];

const NOTES: ClinicalNote[] = [
  { id: "n1", patientId: "p4", patientName: "Sunita Pillai", date: "May 30, 2026", type: "concern",
    note: "Patient reports persistent pain 7/10 and has missed 5 consecutive sessions. Recommend urgent phone call and pain management review before next session.",
    author: "Dr. Priya Nair" },
  { id: "n2", patientId: "p2", patientName: "Meera Iyer", date: "May 28, 2026", type: "concern",
    note: "Adherence dropped to 74% this week. Pain remains at 5/10. Considering protocol adjustment — reduce flexion target to 75° for next 2 weeks.",
    author: "Dr. Priya Nair" },
  { id: "n3", patientId: "p3", patientName: "Rahul Verma", date: "May 27, 2026", type: "milestone",
    note: "Rahul achieved 95° ROM today — ahead of schedule. Cleared for Phase 3 overhead loading. Excellent patient compliance throughout.",
    author: "Dr. Priya Nair" },
  { id: "n4", patientId: "p1", patientName: "Arjun Sharma", date: "May 25, 2026", type: "progress",
    note: "Week 3 check-in. ROM improving steadily at +5°/week. Pain well-controlled at 3/10. Continue current protocol.",
    author: "Dr. Priya Nair" },
  { id: "n5", patientId: "p5", patientName: "Karan Mehta", date: "May 22, 2026", type: "progress",
    note: "Minor ROM plateau observed over last 3 sessions. Increasing flexion load by 10% next week. Patient motivated and compliant.",
    author: "Dr. Priya Nair" },
];


/* ── Config ─────────────────────────────────────────────────────────── */
const statusConfig: Record<ReportStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  reviewed: { label: "Reviewed", bg: "var(--accent-light)",  color: "var(--accent-dark)",
    icon: <CheckCircle2 style={{ width: 12, height: 12 }} /> },
  pending:  { label: "Pending",  bg: "var(--warn-light)",    color: "var(--warn)",
    icon: <Clock style={{ width: 12, height: 12 }} /> },
  flagged:  { label: "Flagged",  bg: "var(--danger-light)",  color: "var(--danger)",
    icon: <AlertTriangle style={{ width: 12, height: 12 }} /> },
};

const noteConfig: Record<NoteType, { label: string; bg: string; border: string; color: string; emoji: string }> = {
  progress:  { label: "Progress",  bg: "var(--primary-light)",   border: "var(--primary-mid)",          color: "var(--primary)",    emoji: "📈" },
  concern:   { label: "Concern",   bg: "var(--danger-light)",    border: "rgba(217,64,64,0.25)",        color: "var(--danger)",     emoji: "⚠️" },
  milestone: { label: "Milestone", bg: "var(--accent-light)",    border: "rgba(14,168,116,0.25)",       color: "var(--accent-dark)",emoji: "🏆" },
};


/* ── Main Page ───────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const [tab, setTab] = useState<"reports" | "notes">("reports");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("Arjun Sharma");

  const filteredReports = REPORTS.filter(r => {
    const matchSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.injury.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredNotes = NOTES.filter(n =>
    n.patientName.toLowerCase().includes(search.toLowerCase()) ||
    n.note.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:    REPORTS.length,
    reviewed: REPORTS.filter(r => r.status === "reviewed").length,
    pending:  REPORTS.filter(r => r.status === "pending").length,
    flagged:  REPORTS.filter(r => r.status === "flagged").length,
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-8 pb-12">

      {/* ── Header ── */}
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
            Reports & Notes
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>
            Patient medical reports processed by Gemini AI, and your clinical notes.
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--secondary)", color: "#fff",
          border: "none", borderRadius: "var(--r-full)",
          padding: "11px 22px", fontSize: 14, fontWeight: 600,
          cursor: "pointer", boxShadow: "0 4px 16px rgba(91,110,245,0.30)",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(91,110,245,0.40)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(91,110,245,0.30)"; }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add Note
        </button>
      </section>

      {/* ── Stat Cards ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Total Reports",  value: stats.total,    icon: FileText,      color: "blue"   },
          { label: "Reviewed",       value: stats.reviewed, icon: CheckCircle2,  color: "green"  },
          { label: "Pending Review", value: stats.pending,  icon: Clock,         color: "amber"  },
          { label: "Flagged",        value: stats.flagged,  icon: AlertTriangle, color: "danger" },
        ].map(({ label, value, icon: Icon, color }) => {
          const p = {
            blue:   { bg: "var(--primary-light)",   ic: "var(--primary)",   border: "rgba(26,110,189,0.18)" },
            green:  { bg: "var(--accent-light)",    ic: "var(--accent)",    border: "rgba(14,168,116,0.18)" },
            amber:  { bg: "var(--warn-light)",      ic: "var(--warn)",      border: "rgba(232,147,10,0.18)" },
            danger: { bg: "var(--danger-light)",    ic: "var(--danger)",    border: "rgba(217,64,64,0.18)" },
          }[color]!;
          return (
            <div key={label} style={{ background: "#fff", border: `1px solid ${p.border}`, borderRadius: "var(--r-lg)", padding: "18px 20px", boxShadow: "var(--shadow-card)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon style={{ width: 16, height: 16, color: p.ic }} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "var(--text-1)", lineHeight: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{label}</div>
            </div>
          );
        })}
      </section>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)" }}>
        {(["reports", "notes"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            background: "transparent", border: "none",
            borderBottom: `2px solid ${tab === t ? "var(--secondary)" : "transparent"}`,
            color: tab === t ? "var(--secondary)" : "var(--text-3)",
            transition: "all 0.15s",
          }}>
            {t === "reports" ? `📋 Medical Reports (${REPORTS.length})` : `📝 Clinical Notes (${NOTES.length})`}
          </button>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
          <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab === "reports" ? "Search by patient or condition..." : "Search notes..."}
            style={{ paddingLeft: "42px !important" } as React.CSSProperties} />
        </div>
        {tab === "reports" && (
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "reviewed", "pending", "flagged"] as const).map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{
                padding: "8px 14px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 600,
                cursor: "pointer", textTransform: "capitalize",
                border: `1px solid ${statusFilter === f ? "var(--secondary)" : "var(--border)"}`,
                background: statusFilter === f ? "var(--secondary-light)" : "transparent",
                color: statusFilter === f ? "var(--secondary)" : "var(--text-3)",
                transition: "all 0.15s",
              }}>{f === "all" ? "All" : f}</button>
            ))}
          </div>
        )}
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)", fontSize: 13 }}>
          <Filter style={{ width: 14, height: 14 }} /> Filter
        </button>
      </div>


      {/* ── Reports Tab ── */}
      {tab === "reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredReports.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
              <FileText style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontSize: 15 }}>No reports match your search.</p>
            </div>
          )}
          {filteredReports.map(r => {
            const st = statusConfig[r.status];
            const isOpen = expandedReport === r.id;
            return (
              <div key={r.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
                {/* Row */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", cursor: "pointer" }}
                  onClick={() => setExpandedReport(isOpen ? null : r.id)}>
                  {/* Avatar */}
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, var(--secondary-light), var(--primary-light))", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "var(--secondary)", flexShrink: 0 }}>
                    {r.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{r.patientName}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                      {r.injury} · Week {r.week} · {r.reportDate}
                    </div>
                  </div>
                  {/* File name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>
                    <FileText style={{ width: 13, height: 13 }} />
                    {r.fileName}
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button title="Download" style={{ padding: "6px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                      <Download style={{ width: 13, height: 13 }} />
                    </button>
                    <Link href={`/doctor/patients/${r.patientId}`} title="View Patient"
                      style={{ padding: "6px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, textDecoration: "none" }}>
                      <Eye style={{ width: 13, height: 13 }} /> Patient
                    </Link>
                    {isOpen
                      ? <ChevronRight style={{ width: 16, height: 16, color: "var(--text-3)", transform: "rotate(90deg)", transition: "transform 0.2s" }} />
                      : <ChevronRight style={{ width: 16, height: 16, color: "var(--text-3)", transition: "transform 0.2s" }} />
                    }
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-subtle)", padding: "20px 22px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)", marginBottom: 6 }}>Surgery</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{r.extractedSurgery}</div>
                      </div>
                      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)", marginBottom: 6 }}>ROM Target</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", fontFamily: "var(--font-data)" }}>{r.extractedROM}</div>
                      </div>
                      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)", marginBottom: 6 }}>Restrictions</div>
                        {r.extractedRestrictions.map((res, i) => (
                          <div key={i} style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 2 }}>• {res}</div>
                        ))}
                      </div>
                    </div>
                    {/* AI Summary */}
                    <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: "var(--r-md)", padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🤖</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Gemini AI Summary</div>
                        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{r.aiSummary}</p>
                      </div>
                    </div>
                    {/* Mark reviewed */}
                    {r.status !== "reviewed" && (
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: "var(--r-full)", background: "var(--accent)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 10px rgba(14,168,116,0.25)" }}>
                          <CheckCircle2 style={{ width: 14, height: 14 }} /> Mark as Reviewed
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Notes Tab ── */}
      {tab === "notes" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
          {/* Notes list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredNotes.map(n => {
              const nc = noteConfig[n.type];
              return (
                <div key={n.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "20px 22px", boxShadow: "var(--shadow-card)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--secondary-light), var(--primary-light))", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--secondary)", flexShrink: 0 }}>
                        {n.patientName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{n.patientName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-3)" }}>{n.date} · {n.author}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: nc.bg, border: `1px solid ${nc.border}`, color: nc.color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        {nc.emoji} {nc.label}
                      </span>
                      <Link href={`/doctor/patients/${n.patientId}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--primary)", textDecoration: "none", padding: "4px 10px", borderRadius: "var(--r-full)", border: "1px solid var(--primary-mid)", background: "var(--primary-light)" }}>
                        <Activity style={{ width: 12, height: 12 }} /> View Patient
                      </Link>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, borderLeft: `3px solid ${nc.border}`, paddingLeft: 14 }}>
                    {n.note}
                  </p>
                </div>
              );
            })}
            {filteredNotes.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
                <Stethoscope style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.4 }} />
                <p style={{ fontSize: 15 }}>No notes found.</p>
              </div>
            )}
          </div>

          {/* Add Note Panel */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)", position: "sticky", top: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 18 }}>
              Add Clinical Note
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Patient</label>
              <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--r-md)", border: "1.5px solid var(--border)", background: "var(--bg-input)", fontSize: 14, color: "var(--text-1)", outline: "none" }}>
                {REPORTS.map(r => <option key={r.patientId}>{r.patientName}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Note</label>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                rows={5} placeholder="Write your clinical observation..."
                style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--r-md)", border: "1.5px solid var(--border)", background: "var(--bg-input)", fontSize: 14, color: "var(--text-1)", resize: "vertical", outline: "none", fontFamily: "var(--font-body)", lineHeight: 1.6 }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--secondary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91,110,245,0.12)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <button
              disabled={!newNote.trim()}
              style={{ width: "100%", padding: "12px", borderRadius: "var(--r-full)", background: newNote.trim() ? "var(--secondary)" : "var(--border)", color: newNote.trim() ? "#fff" : "var(--text-4)", border: "none", fontSize: 14, fontWeight: 600, cursor: newNote.trim() ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: newNote.trim() ? "0 4px 14px rgba(91,110,245,0.25)" : "none" }}
            >
              Save Note
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
