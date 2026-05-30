"use client";

import { useState } from "react";
import {
  Plus, Search, ChevronDown, ChevronRight, Copy,
  Edit2, Trash2, CheckCircle2, Clock, Users, FileText,
  RotateCcw, Zap, Shield,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────── */
type Exercise = { name: string; sets: number; reps: string; target: string; notes?: string };
type Protocol = {
  id: string; name: string; category: string; duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  patients: number; exercises: Exercise[]; description: string; tag: string;
};

/* ── Dummy data ─────────────────────────────────────────────────────── */
const PROTOCOLS: Protocol[] = [
  {
    id: "proto-1", name: "ACL Post-Op Phase 1", category: "Knee", duration: "Weeks 1–4",
    level: "Beginner", patients: 2, tag: "ACL",
    description: "Gentle ROM restoration and quad activation. Focus on swelling management and basic weight-bearing.",
    exercises: [
      { name: "Heel Slides",            sets: 3, reps: "15",     target: "90° flexion" },
      { name: "Quad Sets",              sets: 3, reps: "20",     target: "Full extension", notes: "Hold 5s" },
      { name: "Straight Leg Raises",    sets: 3, reps: "10",     target: "30° elevation" },
      { name: "Ankle Pumps",            sets: 5, reps: "20",     target: "Full ROM" },
      { name: "Seated Knee Extension",  sets: 3, reps: "12",     target: "45°" },
    ],
  },
  {
    id: "proto-2", name: "ACL Post-Op Phase 2", category: "Knee", duration: "Weeks 5–10",
    level: "Intermediate", patients: 1, tag: "ACL",
    description: "Progressive loading with hamstring focus, proprioception training, and closed-chain exercises.",
    exercises: [
      { name: "Mini Squats",            sets: 4, reps: "15",     target: "60° flexion" },
      { name: "Leg Press",              sets: 3, reps: "12",     target: "80% load" },
      { name: "Step-Ups",               sets: 3, reps: "10/leg", target: "Step height 15cm" },
      { name: "Hamstring Curls",        sets: 3, reps: "12",     target: "90°", notes: "Slow eccentric" },
      { name: "Balance Board",          sets: 3, reps: "60s",    target: "Single leg" },
    ],
  },
  {
    id: "proto-3", name: "TKR Recovery Standard", category: "Knee", duration: "Weeks 1–8",
    level: "Beginner", patients: 1, tag: "TKR",
    description: "Total knee replacement protocol. Pain-guided progression focusing on functional mobility.",
    exercises: [
      { name: "Passive ROM (CPM-sim)",  sets: 1, reps: "20 min", target: "70° at W2" },
      { name: "Heel Prop Extension",    sets: 4, reps: "30 min", target: "Full extension" },
      { name: "Seated Flexion Slides",  sets: 3, reps: "15",     target: "80° at W4" },
      { name: "Short Arc Quads",        sets: 3, reps: "15",     target: "Terminal extension" },
    ],
  },
  {
    id: "proto-4", name: "Rotator Cuff — Advanced", category: "Shoulder", duration: "Weeks 7–12",
    level: "Advanced", patients: 1, tag: "Shoulder",
    description: "Rotator cuff strengthening with progressive theraband and overhead loading for athletes.",
    exercises: [
      { name: "External Rotation — Band", sets: 4, reps: "15",   target: "Full ROM" },
      { name: "Scaption Raises",          sets: 3, reps: "12",   target: "90° elevation" },
      { name: "PNF D1/D2 Patterns",       sets: 3, reps: "10",   target: "Full pattern", notes: "Diagonal patterns" },
      { name: "Overhead Press — Light",   sets: 3, reps: "10",   target: "Full extension" },
    ],
  },
  {
    id: "proto-5", name: "Hip Replacement Phase 1", category: "Hip", duration: "Weeks 1–3",
    level: "Beginner", patients: 1, tag: "THR",
    description: "Early post-operative hip replacement program. Precautions: no flexion > 90°, no internal rotation.",
    exercises: [
      { name: "Ankle Pumps",            sets: 5, reps: "20",     target: "Full ROM" },
      { name: "Heel Slides",            sets: 3, reps: "15",     target: "45° flexion max" },
      { name: "Glute Squeezes",         sets: 4, reps: "20",     target: "Hold 5s" },
      { name: "Abduction in Bed",       sets: 3, reps: "15",     target: "30° max" },
      { name: "Bridging (Assisted)",    sets: 3, reps: "10",     target: "Full height", notes: "Pillow between knees" },
    ],
  },
];

const ASSIGNMENTS = [
  { patient: "Arjun Sharma",  protocol: "ACL Post-Op Phase 1", assigned: "May 8",  progress: 68, status: "active" },
  { patient: "Meera Iyer",    protocol: "TKR Recovery Standard",assigned: "Apr 20", progress: 45, status: "active" },
  { patient: "Rahul Verma",   protocol: "Rotator Cuff — Advanced",assigned:"Mar 12",progress: 91, status: "active" },
  { patient: "Sunita Pillai", protocol: "Hip Replacement Phase 1",assigned:"May 25", progress: 22, status: "attention" },
  { patient: "Karan Mehta",   protocol: "ACL Post-Op Phase 2",  assigned: "May 5",  progress: 54, status: "active" },
];

/* ── Sub-components ──────────────────────────────────────────────────── */
const levelStyle: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: "var(--accent-light)",    color: "var(--accent-dark)" },
  Intermediate: { bg: "var(--primary-light)",   color: "var(--primary)" },
  Advanced:     { bg: "var(--danger-light)",     color: "var(--danger)" },
};

function ProtocolCard({ p }: { p: Protocol }) {
  const [open, setOpen] = useState(false);
  const lv = levelStyle[p.level];

  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-xl)",
      boxShadow: "var(--shadow-card)", overflow: "hidden", transition: "box-shadow 0.22s",
    }}>
      {/* Header */}
      <div
        style={{ padding: "20px 22px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "var(--secondary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText style={{ width: 16, height: 16, color: "var(--secondary)" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>
                {p.name}
              </h3>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{p.category} · {p.duration}</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 460 }}>{p.description}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, marginLeft: 24 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ background: lv.bg, color: lv.color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
              {p.level}
            </span>
            <span style={{ background: "var(--bg-subtle)", color: "var(--text-3)", padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
              {p.tag}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
              <Users style={{ width: 12, height: 12 }} /> {p.patients} patient{p.patients !== 1 ? "s" : ""}
            </span>
            {open
              ? <ChevronDown style={{ width: 16, height: 16, color: "var(--text-3)" }} />
              : <ChevronRight style={{ width: 16, height: 16, color: "var(--text-3)" }} />
            }
          </div>
        </div>
      </div>

      {/* Exercise List (collapsible) */}
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
          <div style={{ padding: "16px 22px 6px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)", marginBottom: 10 }}>
              Exercises ({p.exercises.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {p.exercises.map((ex, i) => (
                <div key={i} style={{
                  background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "var(--primary-light)", border: "1px solid var(--primary-mid)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "var(--primary)", flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{ex.name}</span>
                    {ex.notes && <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 8, fontStyle: "italic" }}>{ex.notes}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-2)" }}>
                    <span><strong style={{ color: "var(--text-1)", fontFamily: "var(--font-data)" }}>{ex.sets}</strong> sets</span>
                    <span><strong style={{ color: "var(--text-1)", fontFamily: "var(--font-data)" }}>{ex.reps}</strong> reps</span>
                    <span style={{ background: "var(--accent-light)", color: "var(--accent-dark)", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
                      🎯 {ex.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action row */}
          <div style={{ display: "flex", gap: 8, padding: "14px 22px", justifyContent: "flex-end" }}>
            {[
              { label: "Assign to Patient", icon: Users,      primary: true  },
              { label: "Duplicate",         icon: Copy,       primary: false },
              { label: "Edit",              icon: Edit2,      primary: false },
              { label: "Delete",            icon: Trash2,     primary: false, danger: true },
            ].map(({ label, icon: Icon, primary, danger }) => (
              <button
                key={label}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: primary ? "var(--secondary)" : danger ? "transparent" : "transparent",
                  color: primary ? "#fff" : danger ? "var(--danger)" : "var(--text-2)",
                  border: `1px solid ${primary ? "var(--secondary)" : danger ? "rgba(217,64,64,0.30)" : "var(--border)"}`,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!primary) e.currentTarget.style.background = danger ? "var(--danger-light)" : "var(--bg-hover)"; }}
                onMouseLeave={e => { if (!primary) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon style={{ width: 12, height: 12 }} /> {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function PrescriptionsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"protocols" | "assignments">("protocols");

  const filtered = PROTOCOLS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-8 pb-12">

      {/* ── Header ── */}
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
            Prescriptions & Protocols
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>
            Manage exercise protocols and assign them to your patients.
          </p>
        </div>
        <button
          style={{
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
          <Plus style={{ width: 16, height: 16 }} /> New Protocol
        </button>
      </section>

      {/* ── Summary Stats ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Total Protocols",    value: PROTOCOLS.length,  icon: FileText,    color: "blue" },
          { label: "Active Assignments", value: ASSIGNMENTS.filter(a => a.status === "active").length, icon: CheckCircle2, color: "green" },
          { label: "Avg Completion",     value: `${Math.round(ASSIGNMENTS.reduce((s, a) => s + a.progress, 0) / ASSIGNMENTS.length)}%`, icon: Zap, color: "purple" },
          { label: "Needs Review",       value: ASSIGNMENTS.filter(a => a.status === "attention").length, icon: Shield, color: "amber" },
        ].map(({ label, value, icon: Icon, color }) => {
          const palette: Record<string, { bg: string; icon: string; border: string }> = {
            blue:   { bg: "var(--primary-light)",   icon: "var(--primary)",   border: "rgba(26,110,189,0.18)" },
            green:  { bg: "var(--accent-light)",    icon: "var(--accent)",    border: "rgba(14,168,116,0.18)" },
            amber:  { bg: "var(--warn-light)",      icon: "var(--warn)",      border: "rgba(232,147,10,0.18)" },
            purple: { bg: "var(--secondary-light)", icon: "var(--secondary)", border: "rgba(91,110,245,0.18)" },
          };
          const p = palette[color];
          return (
            <div key={label} style={{ background: "#fff", border: `1px solid ${p.border}`, borderRadius: "var(--r-lg)", padding: "18px 20px", boxShadow: "var(--shadow-card)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon style={{ width: 16, height: 16, color: p.icon }} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "var(--text-1)", lineHeight: 1, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{label}</div>
            </div>
          );
        })}
      </section>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)" }}>
        {(["protocols", "assignments"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: "transparent", border: "none",
              borderBottom: `2px solid ${tab === t ? "var(--secondary)" : "transparent"}`,
              color: tab === t ? "var(--secondary)" : "var(--text-3)",
              textTransform: "capitalize", transition: "all 0.15s",
            }}
          >
            {t === "protocols" ? `📋 Protocols (${PROTOCOLS.length})` : `👥 Active Assignments (${ASSIGNMENTS.length})`}
          </button>
        ))}
      </div>

      {/* ── Protocols Tab ── */}
      {tab === "protocols" && (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-3)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search protocols by name, category, or tag..."
                style={{ paddingLeft: "42px !important" } as React.CSSProperties}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map(p => <ProtocolCard key={p.id} p={p} />)}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
              <FileText style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.4 }} />
              <p>No protocols found.</p>
            </div>
          )}
        </>
      )}

      {/* ── Assignments Tab ── */}
      {tab === "assignments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr>
                {["Patient", "Protocol", "Assigned", "Completion", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0 16px 8px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSIGNMENTS.map((a, i) => (
                <tr key={i}>
                  <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", borderLeft: "1px solid var(--border)", borderRadius: "var(--r-md) 0 0 var(--r-md)" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{a.patient}</span>
                  </td>
                  <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{a.protocol}</span>
                  </td>
                  <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 12, fontFamily: "var(--font-data)", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock style={{ width: 12, height: 12 }} />{a.assigned}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "var(--bg-subtle)", borderRadius: 9999, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${a.progress}%`,
                          background: a.progress >= 85 ? "var(--accent)" : a.progress >= 50 ? "var(--primary)" : "var(--warn)",
                          borderRadius: 9999, transition: "width 0.6s",
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "var(--font-data)", fontWeight: 600, color: "var(--text-2)", minWidth: 32 }}>{a.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                    <span style={{
                      background: a.status === "active" ? "var(--accent-light)" : "var(--warn-light)",
                      color: a.status === "active" ? "var(--accent-dark)" : "var(--warn)",
                      padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600,
                    }}>
                      {a.status === "active" ? "Active" : "Needs Attention"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", background: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)", borderRadius: "0 var(--r-md) var(--r-md) 0" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button title="Modify Protocol" style={{ padding: "5px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)" }}>
                        <Edit2 style={{ width: 12, height: 12 }} />
                      </button>
                      <button title="Reset Progress" style={{ padding: "5px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)" }}>
                        <RotateCcw style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
