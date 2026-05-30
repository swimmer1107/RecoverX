"use client";

import { useMemo, useState, useEffect } from "react";
import { Download, ShieldAlert, Trash2 } from "lucide-react";
import { getUser } from "../lib/auth";

type Tab = "Account" | "Notifications" | "Privacy & Data";

const sampleExport = {
  sessions: [{ exercise_name: "Knee Flexion", achieved_angle: 82, rep_count: 10 }],
  checkins: [{ pain_score: 4, mood: "Good", created_at: "2026-05-21" }],
  report: { surgeryType: "Total Knee Replacement", allowedROM: { min: 0, max: 90 } },
};

function strength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function Toggle({ on, setOn }: { on: boolean; setOn: (value: boolean) => void }) {
  return <button onClick={() => setOn(!on)} className={`toggle ${on ? "on" : ""}`} aria-pressed={on} />;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Account");
  const [email, setEmail] = useState("arjun@example.com");

  useEffect(() => {
    const user = getUser();
    if (user?.email) {
      setEmail(user.email);
    }
  }, []);
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteDataConfirm, setDeleteDataConfirm] = useState("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showDeleteData, setShowDeleteData] = useState(false);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [progressMilestones, setProgressMilestones] = useState(true);
  const [painAlerts, setPainAlerts] = useState(true);
  const [weeklySummaries, setWeeklySummaries] = useState(true);

  const passwordStrength = strength(newPassword);
  const deviceStatus = useMemo(() => ({
    webgl: typeof window !== "undefined" && !!document.createElement("canvas").getContext("webgl"),
    camera: typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia ? "Available" : "Needs browser permission",
    speech: typeof window !== "undefined" && "speechSynthesis" in window,
  }), []);

  function downloadData() {
    const blob = new Blob([JSON.stringify(sampleExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "antigravity-data-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8">
      <div className="space-grid" />
      <div className="relative z-10 mx-auto max-w-5xl pb-12">
        <header className="mb-6">
          <p className="font-data text-xs uppercase tracking-[0.22em] text-[var(--primary)]">Page 12 / Settings</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--text-1)] md:text-4xl">Settings</h1>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {(["Account", "Notifications", "Privacy & Data"] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full border px-5 py-2 text-sm ${activeTab === tab ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-3)]"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Account" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Change email</h2>
              <label className="mt-5 block text-xs text-[var(--text-3)]">Current email</label>
              <input value={email} readOnly className="mt-2 w-full rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-2)]" />
              <label className="mt-4 block text-xs text-[var(--text-3)]">New email</label>
              <input className="mt-2 w-full rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-1)] outline-none focus:border-[var(--primary)]" />
              <label className="mt-4 block text-xs text-[var(--text-3)]">Confirm new email</label>
              <input className="mt-2 w-full rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-1)] outline-none focus:border-[var(--primary)]" />
              <button className="btn-primary mt-5 px-6 py-3 text-sm">Update email</button>
            </div>

            <div className="card p-5">
              <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Change password</h2>
              {["Current password", "New password", "Confirm new password"].map((label, index) => (
                <div key={label}>
                  <label className="mt-5 block text-xs text-[var(--text-3)]">{label}</label>
                  <input type="password" value={index === 1 ? newPassword : undefined} onChange={index === 1 ? (event) => setNewPassword(event.target.value) : undefined} className="mt-2 w-full rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-1)] outline-none focus:border-[var(--primary)]" />
                </div>
              ))}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => <div key={step} className={`h-2 rounded-full ${passwordStrength >= step ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]"}`} />)}
              </div>
              <button className="btn-primary mt-5 px-6 py-3 text-sm">Update password</button>
            </div>

            <div className="card border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.05)] p-5 lg:col-span-2">
              <h2 className="font-display text-xl font-semibold text-[var(--danger)]">Danger Zone</h2>
              <p className="mt-2 text-sm text-[var(--text-2)]">Deleting your account permanently removes your profile, reports, sessions, and check-ins.</p>
              <button onClick={() => setShowDeleteAccount(true)} className="btn-danger mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm"><Trash2 className="h-4 w-4" /> Delete Account</button>
            </div>
          </section>
        )}

        {activeTab === "Notifications" && (
          <section className="card p-5">
            <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Notifications</h2>
            <div className="mt-5 divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-display text-sm font-semibold text-[var(--text-1)]">Session reminders</div>
                  <input type="time" defaultValue="09:00" className="mt-2 rounded-full border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-1)]" />
                </div>
                <Toggle on={sessionReminders} setOn={setSessionReminders} />
              </div>
              <NotifyRow label="Progress milestones" on={progressMilestones} setOn={setProgressMilestones} />
              <NotifyRow label="Pain alerts" on={painAlerts} setOn={setPainAlerts} />
              <NotifyRow label="Weekly summaries" on={weeklySummaries} setOn={setWeeklySummaries} />
            </div>
          </section>
        )}

        {activeTab === "Privacy & Data" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Your data</h2>
              <button onClick={downloadData} className="btn-primary mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm"><Download className="h-4 w-4" /> Download My Data</button>
              <button onClick={() => setShowDeleteData(true)} className="btn-danger mt-3 inline-flex items-center gap-2 px-6 py-3 text-sm"><Trash2 className="h-4 w-4" /> Delete All My Data</button>
            </div>

            <div className="card p-5">
              <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Device status</h2>
              <div className="mt-5 space-y-3 text-sm">
                <Status label="WebGL" value={deviceStatus.webgl ? "✓ Supported (required for MediaPipe)" : "Not supported"} />
                <Status label="Camera" value={deviceStatus.camera} href="/session/knee-flexion" />
                <Status label="Microphone" value="N/A (we output only)" />
                <Status label="Speech Synthesis" value={deviceStatus.speech ? "✓ Supported" : "Not supported"} />
              </div>
            </div>
          </section>
        )}
      </div>

      {showDeleteAccount && (
        <ConfirmModal title="Delete Account" confirm={deleteConfirm} setConfirm={setDeleteConfirm} onClose={() => setShowDeleteAccount(false)} />
      )}
      {showDeleteData && (
        <ConfirmModal title="Delete All My Data" confirm={deleteDataConfirm} setConfirm={setDeleteDataConfirm} onClose={() => setShowDeleteData(false)} />
      )}
    </main>
  );
}

function NotifyRow({ label, on, setOn }: { label: string; on: boolean; setOn: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="font-display text-sm font-semibold text-[var(--text-1)]">{label}</span>
      <Toggle on={on} setOn={setOn} />
    </div>
  );
}

function Status({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-3">
      <span className="text-[var(--text-3)]">{label}</span>
      {href ? <a href={href} className="text-right text-[var(--primary)]">{value}</a> : <span className="text-right text-[var(--text-1)]">{value}</span>}
    </div>
  );
}

function ConfirmModal({ title, confirm, setConfirm, onClose }: { title: string; confirm: string; setConfirm: (value: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-md">
      <div className="card max-w-md border-[rgba(239,68,68,0.3)] p-6">
        <ShieldAlert className="mb-4 h-10 w-10 text-[var(--danger)]" />
        <h2 className="font-display text-2xl font-semibold text-[var(--danger)]">{title}</h2>
        <p className="mt-3 text-sm text-[var(--text-2)]">Type <strong>DELETE</strong> to confirm this permanent action.</p>
        <input value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-4 w-full rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-1)] outline-none focus:border-[var(--danger)]" />
        <div className="mt-5 flex gap-3">
          <button disabled={confirm !== "DELETE"} className="btn-danger flex-1 px-5 py-3 text-sm disabled:opacity-40">Confirm Delete</button>
          <button onClick={onClose} className="btn-ghost flex-1 px-5 py-3 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}
