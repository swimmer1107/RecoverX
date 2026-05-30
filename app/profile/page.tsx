"use client";

import { ChangeEvent, useMemo, useRef, useState, useEffect } from "react";
import { Camera, Check, Copy, KeyRound, Pencil, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUser, updateUser } from "../lib/auth";

type FormTab = "Personal" | "Surgery" | "Emergency";
type Tab = FormTab | "Doctor Access";

type Profile = {
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  surgeryType: string;
  surgeryDate: string;
  operatedSide: string;
  surgeon: string;
  hospital: string;
  currentWeek: string;
  emergencyName: string;
  emergencyPhone: string;
  avatarUrl: string;
};

const initialProfile: Profile = {
  fullName: "Arjun Sharma",
  email: "arjun@example.com",
  dateOfBirth: "1974-09-14",
  gender: "Male",
  phone: "+91 98765 43210",
  surgeryType: "Total Knee Replacement",
  surgeryDate: "2026-05-01",
  operatedSide: "Right",
  surgeon: "Dr. Meera Kapoor",
  hospital: "Apollo Orthopaedic Centre",
  currentWeek: "3",
  emergencyName: "Priya Sharma",
  emergencyPhone: "+91 98765 11111",
  avatarUrl: "",
};

const fields: Record<FormTab, Array<{ key: keyof Profile; label: string; type?: string }>> = {
  Personal: [
    { key: "fullName", label: "Full name" },
    { key: "dateOfBirth", label: "Date of birth", type: "date" },
    { key: "gender", label: "Gender" },
    { key: "phone", label: "Phone" },
  ],
  Surgery: [
    { key: "surgeryType", label: "Surgery type" },
    { key: "surgeryDate", label: "Surgery date", type: "date" },
    { key: "operatedSide", label: "Operated side" },
    { key: "surgeon", label: "Surgeon" },
    { key: "hospital", label: "Hospital" },
    { key: "currentWeek", label: "Current week", type: "number" },
  ],
  Emergency: [
    { key: "emergencyName", label: "Contact name" },
    { key: "emergencyPhone", label: "Contact phone" },
  ],
};

function createAccessCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const raw = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

async function saveProfile(profile: Profile) {
  window.localStorage.setItem("antigravity-profile", JSON.stringify(profile));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);
  await supabase.from("patient_profiles").update({
    full_name: profile.fullName,
    date_of_birth: profile.dateOfBirth,
    gender: profile.gender,
    phone: profile.phone,
    surgery_type: profile.surgeryType,
    surgery_date: profile.surgeryDate,
    operated_side: profile.operatedSide,
    surgeon_name: profile.surgeon,
    hospital: profile.hospital,
    current_week: Number(profile.currentWeek),
    emergency_contact_name: profile.emergencyName,
    emergency_contact_phone: profile.emergencyPhone,
    avatar_url: profile.avatarUrl || null,
  }).eq("user_id", "demo-user");
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<Tab>("Personal");
  const [editing, setEditing] = useState<keyof Profile | null>(null);
  const [showSave, setShowSave] = useState(false);
  const [toast, setToast] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
    } else {
      const nextProfile = {
        fullName: user.name,
        email: user.email,
        dateOfBirth: "1974-09-14",
        gender: "Male",
        phone: "+91 98765 43210",
        surgeryType: user.surgeryType || "Total Knee Replacement",
        surgeryDate: user.surgeryDate || "2026-05-01",
        operatedSide: user.side || "Right",
        surgeon: user.surgeon || "Dr. Meera Kapoor",
        hospital: user.hospital || "Apollo Orthopaedic Centre",
        currentWeek: String(user.week || "3"),
        emergencyName: "Priya Sharma",
        emergencyPhone: "+91 98765 11111",
        avatarUrl: "",
      };
      setProfile(nextProfile);
      window.localStorage.setItem("antigravity-profile", JSON.stringify(nextProfile));
    }
  }, [router]);

  useEffect(() => {
    const savedCode = window.localStorage.getItem("antigravity-access-code");
    if (savedCode) {
      setAccessCode(savedCode);
      return;
    }
    const nextCode = createAccessCode();
    window.localStorage.setItem("antigravity-access-code", nextCode);
    setAccessCode(nextCode);
  }, []);

  const initials = useMemo(() => {
    return profile.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  }, [profile.fullName]);

  function updateField(key: keyof Profile, value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setShowSave(true);
  }

  async function handleSave() {
    await saveProfile(profile);
    updateUser({
      name: profile.fullName,
      surgeryType: profile.surgeryType,
      surgeryDate: profile.surgeryDate,
      side: profile.operatedSide,
      surgeon: profile.surgeon,
      hospital: profile.hospital,
      week: Number(profile.currentWeek) || 1
    });
    setEditing(null);
    setShowSave(false);
    setToast("Profile updated ✓");
    window.setTimeout(() => setToast(""), 2400);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function handleGenerateCode() {
    const nextCode = createAccessCode();
    window.localStorage.setItem("antigravity-access-code", nextCode);
    setAccessCode(nextCode);
    showToast("New code generated ✓");
  }

  async function handleCopyCode() {
    if (!accessCode) return;
    try {
      await navigator.clipboard.writeText(accessCode);
      showToast("Copied!");
    } catch {
      showToast("Copy failed");
    }
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatarUrl: preview }));
    setShowSave(true);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8">
      <div className="space-grid" />
      <div className="relative z-10 mx-auto max-w-6xl pb-12">
        <header className="mb-6">
          <p className="font-data text-xs uppercase tracking-[0.22em] text-[var(--primary)]">Page 11 / Profile</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--text-1)] md:text-4xl">Patient Profile</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="card h-fit p-6 text-center">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] bg-cover bg-center font-display text-[40px] font-bold text-white shadow-[var(--shadow-glow-blue)]"
              style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})` } : undefined}
              aria-label="Profile photo"
            >
              {!profile.avatarUrl && initials}
            </div>
            <button onClick={() => fileRef.current?.click()} className="btn-ghost mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs">
              <Camera className="h-3.5 w-3.5" />
              Change photo
            </button>
            <h2 className="mt-5 font-display text-2xl font-semibold text-[var(--text-1)]">{profile.fullName}</h2>
            <p className="mt-1 text-sm text-[var(--text-3)]">{profile.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="badge badge-blue">{profile.surgeryType}</span>
              <span className="badge badge-green">Week {profile.currentWeek}</span>
            </div>
          </aside>

          <section className="card p-5">
            <div className="mb-5 flex flex-wrap gap-2">
              {(["Personal", "Surgery", "Emergency", "Doctor Access"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full border px-5 py-2 text-sm ${activeTab === tab ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-3)]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Surgery" && (
              <div className="mb-5 flex flex-wrap gap-2">
                {["Total Knee Replacement", "ACL Repair", "Hip Replacement", "Meniscus Repair"].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateField("surgeryType", type)}
                    className={`rounded-full border px-4 py-2 text-xs ${profile.surgeryType === type ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]" : "border-[var(--border)] text-[var(--text-3)]"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "Doctor Access" ? (
              <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] bg-[var(--primary-light)] text-[var(--primary)]">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[var(--text-1)]">Share with your Doctor</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-2)]">
                      Give this code to your physiotherapist. They can use it to view your progress and track your recovery.
                    </p>
                  </div>
                  <div className="rounded-[var(--r-md)] border border-[var(--primary-mid)] bg-[var(--primary-light)] px-6 py-5 text-center">
                    <div className="font-data text-3xl font-semibold tracking-[0.18em] text-[var(--primary)] md:text-4xl">
                      {accessCode || "--- ---"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button onClick={handleGenerateCode} className="btn-outline inline-flex items-center gap-2 px-5 py-3 text-sm">
                    <RefreshCw className="h-4 w-4" />
                    Generate New Code
                  </button>
                  <button onClick={handleCopyCode} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </button>
                </div>

                <p className="mt-5 text-xs text-[var(--text-3)]">🔒 Code only grants view access. Doctors cannot modify your data.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {fields[activeTab].map((field) => {
                  const isEditing = editing === field.key;
                  return (
                    <div key={field.key} className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider text-[var(--text-3)]">{field.label}</label>
                        <button onClick={() => setEditing(field.key)} className="text-[var(--text-3)] hover:text-[var(--primary)]">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {isEditing ? (
                        <input
                          type={field.type || "text"}
                          value={profile[field.key]}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          className="w-full rounded-[var(--r-sm)] border border-[var(--primary)] bg-[rgba(14,165,233,0.06)] px-3 py-2 text-sm text-[var(--text-1)] outline-none shadow-[0_0_14px_var(--primary-glow)]"
                          autoFocus
                        />
                      ) : (
                        <div className="font-display text-sm font-medium text-[var(--text-1)]">{profile[field.key]}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {showSave && activeTab !== "Doctor Access" && (
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
                  <Check className="h-4 w-4" />
                  Save changes
                </button>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Member since", "May 2026"],
            ["Total Sessions", "18"],
            ["Reports Uploaded", "3"],
            ["Best ROM", "92°"],
          ].map(([label, value]) => (
            <div key={label} className="card p-5">
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">{label}</div>
              <div className="mt-2 font-data text-2xl text-[var(--text-1)]">{value}</div>
            </div>
          ))}
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full border border-[rgba(16,185,129,0.28)] bg-[rgba(16,185,129,0.14)] px-5 py-3 text-sm text-[var(--accent)] shadow-[var(--shadow-float)] backdrop-blur-md">
          {toast}
        </div>
      )}
    </main>
  );
}
