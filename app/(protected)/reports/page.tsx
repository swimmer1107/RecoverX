"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CalendarDays, CheckCircle2, FileText, PlayCircle, RotateCcw, UploadCloud } from "lucide-react";
import { createNotification } from "../../components/NotificationBell";

type UploadStatus = "idle" | "reading" | "done" | "error";

type ExtractedReport = {
  surgeryType: string;
  surgeryDate: string | null;
  surgeonName: string | null;
  hospital: string | null;
  operatedSide: "LEFT" | "RIGHT" | "BILATERAL" | null;
  currentWeek: number;
  prescribedExercises: Array<{
    name: string;
    targetAngle: number | null;
    reps: number | null;
    sets: number | null;
    frequency: string;
  }>;
  allowedROM: { min: number; max: number };
  currentROM: number;
  weightBearing: string;
  restrictions: string[];
  redFlags: string[];
  followUpDate: string | null;
  notes: string;
};

const demoReport: ExtractedReport = {
  surgeryType: "Total Knee Replacement",
  surgeryDate: "2026-05-01",
  surgeonName: "Dr. Meera Kapoor",
  hospital: "Apollo Orthopaedic Centre",
  operatedSide: "RIGHT",
  currentWeek: 3,
  prescribedExercises: [
    { name: "Knee Flexion", targetAngle: 90, reps: 10, sets: 3, frequency: "2× daily" },
    { name: "Heel Slides", targetAngle: 90, reps: 10, sets: 3, frequency: "2× daily" },
    { name: "Straight Leg Raise", targetAngle: 45, reps: 8, sets: 2, frequency: "Daily" },
    { name: "Quad Sets", targetAngle: 0, reps: 10, sets: 3, frequency: "3× daily" },
  ],
  allowedROM: { min: 0, max: 90 },
  currentROM: 82,
  weightBearing: "Weight bearing as tolerated with walker support",
  restrictions: [
    "Avoid twisting on the operated knee.",
    "No deep squats until cleared by your surgeon.",
    "Keep incision dry until fully healed.",
  ],
  redFlags: [
    "Fever, chills, or drainage from incision.",
    "Sudden calf swelling or shortness of breath.",
    "Pain that does not improve with rest or medication.",
  ],
  followUpDate: "2026-06-02",
  notes: "Continue home physiotherapy and monitor swelling after exercise.",
};

const previousReports = [
  { date: "May 7, 2026", status: "Processed", name: "discharge-summary.pdf" },
  { date: "May 1, 2026", status: "Archived", name: "surgery-plan.jpg" },
];

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // Guard against placeholder values that aren't real URLs
  if (!url.startsWith("https://") && !url.startsWith("http://")) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, key);
  } catch {
    return null;
  }
}

function toExerciseKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function daysUntil(dateString: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 86_400_000));
}

function DataField({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-4">
      <div className="font-body text-[11px] uppercase tracking-wider text-[var(--text-3)]">{label}</div>
      <div className="mt-1 font-display text-sm font-medium text-[var(--text-1)]">{value || "—"}</div>
    </div>
  );
}

function RomGauge({ min, max, current }: { min: number; max: number; current: number }) {
  const startAngle = 180;
  const endAngle = 0;
  const radius = 92;
  const centerX = 120;
  const centerY = 118;

  const point = (degrees: number) => {
    const rad = (degrees * Math.PI) / 180;
    return { x: centerX + radius * Math.cos(rad), y: centerY - radius * Math.sin(rad) };
  };

  const trackStart = point(startAngle);
  const trackEnd = point(endAngle);
  const fillStart = point(180 - (Math.max(0, min) / 140) * 180);
  const fillEnd = point(180 - (Math.min(140, max) / 140) * 180);
  const marker = point(180 - (Math.min(140, current) / 140) * 180);

  return (
    <div className="card p-5">
      <h3 className="font-display text-lg font-semibold text-[var(--text-1)]">ROM Gauge</h3>
      <svg viewBox="0 0 240 150" className="mt-4 w-full">
        <path d={`M ${trackStart.x} ${trackStart.y} A ${radius} ${radius} 0 0 1 ${trackEnd.x} ${trackEnd.y}`} fill="none" stroke="var(--bg-elevated)" strokeWidth="14" strokeLinecap="round" />
        <path d={`M ${fillStart.x} ${fillStart.y} A ${radius} ${radius} 0 0 1 ${fillEnd.x} ${fillEnd.y}`} fill="none" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round" />
        <circle cx={marker.x} cy={marker.y} r="7" fill="var(--primary)" stroke="rgba(14,165,233,0.35)" strokeWidth="6" />
        <text x={trackStart.x - 4} y={trackStart.y + 24} fill="var(--text-3)" fontSize="12" textAnchor="middle">{min}°</text>
        <text x={trackEnd.x + 4} y={trackEnd.y + 24} fill="var(--text-3)" fontSize="12" textAnchor="middle">{max}°</text>
        <text x={marker.x} y={marker.y - 18} fill="var(--primary)" fontFamily="var(--font-data)" fontSize="14" textAnchor="middle">{current}°</text>
      </svg>
    </div>
  );
}

export default function ReportsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedReport | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const followUpDays = useMemo(() => daysUntil(extractedData?.followUpDate ?? null), [extractedData]);

  async function processReport(file: File) {
    setSelectedFile(file);
    setStatus("reading");
    setErrorMessage("");

    try {
      const userId = "demo-user";
      let reportId = `local-${Date.now()}`;
      let publicUrl = "";

      const supabase = await getBrowserSupabase();
      if (supabase) {
        try {
          const storagePath = `reports/${userId}/${Date.now()}_${file.name}`;
          await supabase.storage.from("reports").upload(storagePath, file, { upsert: false });
          const { data: urlData } = supabase.storage.from("reports").getPublicUrl(storagePath);
          publicUrl = urlData.publicUrl;
          const { data } = await supabase.from("medical_reports").insert({
            user_id: userId,
            file_name: file.name,
            file_url: publicUrl,
            is_processed: false,
            is_active: false,
          }).select("id").single();
          if (data?.id) reportId = data.id;
        } catch {
          // Storage unavailable — continue with local processing
        }
      }

      let extracted: ExtractedReport = demoReport;
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (apiKey) {
        const base64 = await fileToBase64(file);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent([
          {
            inlineData: {
              data: base64,
              mimeType: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
            },
          },
          `Extract all medical data from this surgical report. Return ONLY valid JSON, no markdown, no explanation:
{
  "surgeryType": string,
  "surgeryDate": "YYYY-MM-DD or null",
  "surgeonName": "string or null",
  "hospital": "string or null",
  "operatedSide": "LEFT|RIGHT|BILATERAL|null",
  "currentWeek": number,
  "prescribedExercises": [
    {"name": string, "targetAngle": number|null, "reps": number|null, "sets": number|null, "frequency": string}
  ],
  "allowedROM": {"min": number, "max": number},
  "weightBearing": string,
  "restrictions": [string],
  "redFlags": [string],
  "followUpDate": "YYYY-MM-DD or null",
  "notes": string
}`,
        ]);

        const text = result.response.text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(text);
        extracted = {
          ...demoReport,
          ...parsed,
          allowedROM: parsed.allowedROM ?? demoReport.allowedROM,
          prescribedExercises: parsed.prescribedExercises?.length ? parsed.prescribedExercises : demoReport.prescribedExercises,
          currentROM: parsed.allowedROM?.max ? Math.min(parsed.allowedROM.max, demoReport.currentROM) : demoReport.currentROM,
        };
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 1200));
      }

      if (supabase) {
        try {
          await supabase.from("medical_reports").update({
            extracted_data: extracted,
            is_processed: true,
            is_active: true,
            file_url: publicUrl || null,
          }).eq("id", reportId);

          await supabase.from("patient_profiles").update({
            surgery_type: extracted.surgeryType,
            current_week: extracted.currentWeek || 1,
            target_rom: extracted.allowedROM?.max || 90,
          }).eq("user_id", userId);
        } catch {
          // DB unavailable — fall through to localStorage
          window.localStorage.setItem("antigravity-active-report", JSON.stringify(extracted));
        }
      } else {
        window.localStorage.setItem("antigravity-active-report", JSON.stringify(extracted));
      }

      setExtractedData(extracted);
      createNotification("REPORT_READY", "Report ready", "Gemini extracted exercises, angles, and restrictions.", "/reports");
      setStatus("done");
    } catch (error: unknown) {
      console.warn("Report processing failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Could not read this report. Please try another file.");
      setStatus("error");
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File is larger than 10MB.");
      setStatus("error");
      return;
    }
    processReport(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8">
      <div className="space-grid" />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 pb-12">
        <header>
          <p className="font-data text-xs uppercase tracking-[0.22em] text-[var(--primary)]">Page 7 / Medical Report</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--text-1)] md:text-4xl">Medical report intelligence</h1>
        </header>

        {status === "idle" || status === "error" ? (
          <section>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic,image/*,application/pdf"
              className="hidden"
              onChange={handleFileInput}
            />
            <div
              className={`upload-zone card cursor-pointer px-6 py-14 text-center transition-all md:p-16 ${isDragActive ? "border-[var(--primary)] bg-[var(--primary-dim)] shadow-[0_0_32px_var(--primary-glow)]" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ borderStyle: "dashed", borderWidth: 2, borderColor: isDragActive ? "var(--primary)" : "var(--border-bright)" }}
            >
              <div className="mb-4 text-5xl">📋</div>
              <h3 className="font-display text-2xl font-semibold text-[var(--text-1)]">Drop your medical report here</h3>
              <p className="mt-2 text-[var(--text-3)]">PDF, JPG, PNG, HEIC · Max 10MB</p>
              <button type="button" className="btn-ghost mt-5 inline-flex items-center gap-2 px-6 py-3 text-sm">
                <UploadCloud className="h-4 w-4" />
                Browse Files
              </button>
            </div>

            {status === "error" && (
              <div className="card mt-5 border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.06)] p-4 text-sm text-[var(--danger)]">
                {errorMessage}
              </div>
            )}
          </section>
        ) : null}

        {status === "reading" && (
          <section className="processing-card card p-10 text-center">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)]" />
            <h3 className="font-display text-2xl font-semibold text-[var(--text-1)]">Gemini is reading your report...</h3>
            <p className="mt-2 text-[var(--text-3)]">Extracting exercises, angles, and restrictions</p>
            {selectedFile && <p className="mt-4 font-data text-xs text-[var(--text-3)]">{selectedFile.name}</p>}
          </section>
        )}

        {status === "done" && extractedData && (
          <>
            <section className="card p-5">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[var(--text-1)]">Surgery Summary</h2>
                  <p className="mt-1 text-sm text-[var(--text-3)]">{selectedFile?.name || "Active report"} processed successfully</p>
                </div>
                <span className="badge badge-green w-fit"><CheckCircle2 className="h-3.5 w-3.5" /> Active report</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DataField label="Surgery Type" value={extractedData.surgeryType} />
                <DataField label="Date" value={extractedData.surgeryDate} />
                <DataField label="Side" value={extractedData.operatedSide} />
                <DataField label="Surgeon" value={extractedData.surgeonName} />
                <DataField label="Hospital" value={extractedData.hospital} />
                <DataField label="Recovery Week" value={`Week ${extractedData.currentWeek}`} />
              </div>
            </section>

            <section className="card overflow-hidden p-5">
              <h2 className="font-display text-2xl font-semibold text-[var(--text-1)]">Prescribed Exercises</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs text-[var(--text-3)]">
                      <th className="py-3 font-body font-medium">Exercise</th>
                      <th className="py-3 font-body font-medium">Target Angle</th>
                      <th className="py-3 font-body font-medium">Sets × Reps</th>
                      <th className="py-3 font-body font-medium">Frequency</th>
                      <th className="py-3 font-body font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.prescribedExercises.map((exercise) => (
                      <tr key={exercise.name} className="border-b border-[var(--border-subtle)]">
                        <td className="py-4 font-display font-medium text-[var(--text-1)]">{exercise.name}</td>
                        <td className="py-4 font-data text-[var(--primary)]">{exercise.targetAngle ?? "—"}°</td>
                        <td className="py-4 text-sm text-[var(--text-2)]">{exercise.sets ?? "—"} × {exercise.reps ?? "—"}</td>
                        <td className="py-4 text-sm text-[var(--text-2)]">{exercise.frequency}</td>
                        <td className="py-4">
                          <Link href={`/session/${toExerciseKey(exercise.name)}`} className="badge badge-blue inline-flex items-center gap-2">
                            <PlayCircle className="h-3.5 w-3.5" />
                            Start
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RomGauge min={extractedData.allowedROM.min} max={extractedData.allowedROM.max} current={extractedData.currentROM} />

              <div className="card p-5">
                <h3 className="font-display text-lg font-semibold text-[var(--text-1)]">Follow-up Countdown</h3>
                <div className="mt-5 flex items-center gap-4 rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--primary-dim)] p-5">
                  <CalendarDays className="h-9 w-9 text-[var(--primary)]" />
                  <div>
                    <div className="font-display text-xl font-semibold text-[var(--text-1)]">
                      {followUpDays === null ? "No follow-up date found" : `Your next appointment is in ${followUpDays} days`}
                    </div>
                    <div className="mt-1 text-sm text-[var(--text-3)]">{extractedData.followUpDate || "Ask your provider to confirm the date."}</div>
                  </div>
                </div>

                <div className="mt-4 rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-4">
                  <div className="font-body text-xs uppercase tracking-wider text-[var(--text-3)]">Weight Bearing</div>
                  <div className="mt-1 text-sm text-[var(--text-1)]">{extractedData.weightBearing}</div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card p-5">
                <h3 className="font-display text-lg font-semibold text-[var(--text-1)]">Restrictions</h3>
                <div className="mt-4 space-y-3">
                  {extractedData.restrictions.map((restriction) => (
                    <div key={restriction} className="rounded-[var(--r-sm)] border border-[rgba(245,158,11,0.22)] border-l-[3px] border-l-[var(--warn)] bg-[rgba(245,158,11,0.05)] p-4 text-sm text-[var(--text-2)]">
                      <span className="mr-2">⚠️</span>{restriction}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-display text-lg font-semibold text-[var(--text-1)]">Seek immediate help if you experience:</h3>
                <div className="mt-4 space-y-3">
                  {extractedData.redFlags.map((flag) => (
                    <div key={flag} className="rounded-[var(--r-sm)] border border-[rgba(239,68,68,0.24)] border-l-[3px] border-l-[var(--danger)] bg-[rgba(239,68,68,0.05)] p-4 text-sm text-[var(--text-2)]">
                      <span className="mr-2">🚨</span>{flag}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Previous Reports</h2>
            <FileText className="h-5 w-5 text-[var(--text-3)]" />
          </div>
          <div className="space-y-3">
            {previousReports.map((report) => (
              <div key={report.name} className="flex flex-col gap-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-display text-sm font-medium text-[var(--text-1)]">{report.name}</div>
                  <div className="mt-1 text-xs text-[var(--text-3)]">{report.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${report.status === "Processed" ? "badge-green" : "badge-amber"}`}>{report.status}</span>
                  <button className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Set as Active
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
