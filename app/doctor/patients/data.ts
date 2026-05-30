export type PatientStatus = "excellent" | "on-track" | "attention" | "at-risk";
export type TrendDir = "up" | "flat" | "down";

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  injury: string;
  week: number;
  totalWeeks: number;
  rom: number;
  romTarget: number;
  pain: number;
  adherence: number;
  trend: TrendDir;
  status: PatientStatus;
  sessions: number;
  missedDays: number;
  lastSession: string;
  tags: string[];
  aiSummary: string;
};

export const PATIENTS: Patient[] = [
  {
    id: "p1", name: "Arjun Sharma", age: 34, gender: "M",
    phone: "+91 98765 43210", email: "arjun@example.com",
    injury: "ACL Tear – Post-op", week: 3, totalWeeks: 16,
    rom: 82, romTarget: 120, pain: 3, adherence: 92, trend: "up", status: "on-track",
    sessions: 18, missedDays: 1, lastSession: "Today, 09:14 AM",
    tags: ["ACL", "Post-op", "W3"],
    aiSummary: "Progressing well. ROM improving +5°/wk. Low pain. Maintain current load.",
  },
  {
    id: "p2", name: "Meera Iyer", age: 52, gender: "F",
    phone: "+91 87654 32109", email: "meera@example.com",
    injury: "Total Knee Replacement", week: 6, totalWeeks: 20,
    rom: 68, romTarget: 90, pain: 5, adherence: 74, trend: "flat", status: "attention",
    sessions: 22, missedDays: 5, lastSession: "2 days ago",
    tags: ["TKR", "W6", "High Pain"],
    aiSummary: "Adherence slipping. Pain persists at 5/10. Consider protocol adjustment and physio call.",
  },
  {
    id: "p3", name: "Rahul Verma", age: 28, gender: "M",
    phone: "+91 76543 21098", email: "rahul@example.com",
    injury: "Rotator Cuff Repair", week: 9, totalWeeks: 12,
    rom: 95, romTarget: 100, pain: 1, adherence: 98, trend: "up", status: "excellent",
    sessions: 41, missedDays: 0, lastSession: "Today, 07:45 AM",
    tags: ["Rotator Cuff", "W9", "Elite"],
    aiSummary: "Outstanding progress. On track to complete protocol early. ROM at 95% of target.",
  },
  {
    id: "p4", name: "Sunita Pillai", age: 61, gender: "F",
    phone: "+91 65432 10987", email: "sunita@example.com",
    injury: "Hip Replacement", week: 2, totalWeeks: 24,
    rom: 40, romTarget: 80, pain: 7, adherence: 58, trend: "down", status: "at-risk",
    sessions: 6, missedDays: 5, lastSession: "5 days ago",
    tags: ["THR", "W2", "At Risk"],
    aiSummary: "⚠️ 5 consecutive missed days. Pain 7/10. Recommend urgent outreach and pain management review.",
  },
  {
    id: "p5", name: "Karan Mehta", age: 22, gender: "M",
    phone: "+91 54321 09876", email: "karan@example.com",
    injury: "Patellar Tendon Repair", week: 4, totalWeeks: 14,
    rom: 88, romTarget: 110, pain: 2, adherence: 87, trend: "up", status: "on-track",
    sessions: 20, missedDays: 2, lastSession: "Yesterday",
    tags: ["Patellar", "W4"],
    aiSummary: "Good adherence. Minor ROM plateau last 3 days — consider increasing flexion load.",
  },
  {
    id: "p6", name: "Deepa Krishnan", age: 45, gender: "F",
    phone: "+91 43210 98765", email: "deepa@example.com",
    injury: "Shoulder Impingement", week: 5, totalWeeks: 10,
    rom: 110, romTarget: 120, pain: 2, adherence: 95, trend: "up", status: "excellent",
    sessions: 28, missedDays: 0, lastSession: "Today, 06:30 AM",
    tags: ["Shoulder", "W5"],
    aiSummary: "Exceptional compliance. ROM at 92% of target. Expected early discharge.",
  },
];

export const statusConfig: Record<PatientStatus, { label: string; bg: string; color: string }> = {
  excellent:  { label: "Excellent",  bg: "var(--accent-light)",    color: "var(--accent-dark)" },
  "on-track": { label: "On Track",   bg: "var(--primary-light)",   color: "var(--primary)" },
  attention:  { label: "Attention",  bg: "var(--warn-light)",      color: "var(--warn)" },
  "at-risk":  { label: "At Risk",    bg: "var(--danger-light)",    color: "var(--danger)" },
};

// Per-patient mock session history
export function getMockSessions(patientId: string) {
  const base = patientId === "p4" ? 40 : patientId === "p2" ? 55 : 65;
  return Array.from({ length: 10 }, (_, i) => ({
    date: new Date(2026, 4, 12 + i).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    rom: Math.min(base + i * 2 + (i % 3), 120),
    pain: Math.max(1, 6 - Math.floor(i / 3)),
    reps: 8 + (i % 3),
    status: i === 2 ? "ABANDONED" : "COMPLETED",
  }));
}
