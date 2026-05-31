"use client";

import { useMemo, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Check, Moon, Sparkles } from "lucide-react";
import { createNotification } from "../../components/NotificationBell";

type Swelling = "None" | "Mild" | "Moderate" | "Severe";
type Mood = "Great" | "Good" | "Okay" | "Low";

const swellingOptions: Swelling[] = ["None", "Mild", "Moderate", "Severe"];
const moodOptions: Array<{ label: Mood; emoji: string }> = [
  { label: "Great", emoji: "😊" },
  { label: "Good", emoji: "🙂" },
  { label: "Okay", emoji: "😐" },
  { label: "Low", emoji: "😔" },
];

const week = 3;
const surgeryType = "Total Knee Replacement";
const yesterdayPain = 5;

const history = [
  { pain: 3, mood: "Good" },
  { pain: 4, mood: "Okay" },
  null,
  { pain: 6, mood: "Low" },
  { pain: 5, mood: "Good" },
  { pain: 4, mood: "Good" },
  { pain: 3, mood: "Great" },
];

function painTone(pain: number) {
  if (pain <= 3) return { color: "#10B981", label: "Low pain" };
  if (pain <= 6) return { color: "#F59E0B", label: "Moderate pain" };
  return { color: "#EF4444", label: "High pain" };
}

async function saveCheckin(payload: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    window.localStorage.setItem(`antigravity-checkin-${Date.now()}`, JSON.stringify(payload));
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);
  await supabase.from("daily_checkins").insert(payload);
}

export default function CheckinPage() {
  const [painScore, setPainScore] = useState(4);
  const [swelling, setSwelling] = useState<Swelling>("Mild");
  const [mood, setMood] = useState<Mood>("Good");
  const [sleptWell, setSleptWell] = useState(true);
  const [notes, setNotes] = useState("");
  const [insight, setInsight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPainAlert, setShowPainAlert] = useState(false);

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }, []);
  const tone = painTone(painScore);

  async function submitCheckin() {
    setIsSubmitting(true);
    if (painScore >= 7) {
      setShowPainAlert(true);
      createNotification("PAIN_ALERT", "High pain reported", `Daily check-in pain score: ${painScore}/10`, "/checkin");
    }
    const fallback =
      painScore >= 7
        ? "Your pain is high today. Please rest and contact your physiotherapist before exercising."
        : painScore < yesterdayPain
          ? `Pain is down from yesterday — nice progress. Keep today gentle and steady.`
          : `Thanks for checking in. Keep movements calm today and listen to your knee.`;

    let text = fallback;
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const insightPrompt = `Post-surgery patient (Week ${week}, ${surgeryType}) daily check-in:
Pain: ${painScore}/10, Swelling: ${swelling}, Mood: ${mood}, Sleep: ${sleptWell ? "good" : "poor"}

Write ONE warm, caring sentence (under 25 words) as their physiotherapist.
If pain >= 7: tell them to contact their physiotherapist and rest today.
If pain is improving vs yesterday (${yesterdayPain}): acknowledge the progress.
Be specific and human. No medical jargon.`;
        const result = await model.generateContent(insightPrompt);
        text = result.response.text().trim().replace(/[*_"]/g, "");
      } catch (error) {
        console.warn("Gemini check-in insight skipped:", error);
      }
    }

    await saveCheckin({
      user_id: "demo-user",
      pain_score: painScore,
      swelling,
      mood,
      slept_well: sleptWell,
      notes,
      insight: text,
      created_at: new Date().toISOString(),
    });

    setInsight(text);
    setIsSubmitting(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8">
      <div className="space-grid" />
      <div className="relative z-10 mx-auto max-w-[560px] pb-12">
        <header className="mb-6 text-center">
          <h1 className="font-display text-4xl font-semibold text-[var(--text-1)]">Daily Check-in</h1>
          <p className="mt-2 font-data text-xs uppercase tracking-[0.18em] text-[var(--primary)]">{todayLabel}</p>
          <p className="mt-3 text-[var(--text-3)]">30 seconds · Your physiotherapist will thank you</p>
        </header>

        <section className="card p-6">
          <div className="pain-section">
            <label className="font-display text-sm font-semibold text-[var(--text-1)]">Pain level right now</label>
            <div
              className="pain-display my-4 text-center font-data text-[64px] font-medium leading-none"
              style={{ color: tone.color, textShadow: `0 0 22px ${tone.color}55` }}
            >
              {painScore}
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={painScore}
              onChange={(event) => setPainScore(Number(event.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: tone.color }}
            />
            <div className="mt-2 flex justify-between text-xs text-[var(--text-3)]">
              <span>No pain</span>
              <span>Worst pain</span>
            </div>
          </div>

          <div className="mt-7">
            <label className="font-display text-sm font-semibold text-[var(--text-1)]">Swelling</label>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {swellingOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSwelling(option)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    swelling === option
                      ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--text-1)] shadow-[0_0_16px_var(--primary-glow)]"
                      : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-2)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <label className="font-display text-sm font-semibold text-[var(--text-1)]">Mood</label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {moodOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setMood(option.label)}
                  className={`rounded-full border px-4 py-3 text-lg transition-all ${
                    mood === option.label
                      ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--text-1)]"
                      : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-2)]"
                  }`}
                >
                  <span className="mr-2">{option.emoji}</span>{option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSleptWell((value) => !value)}
            className={`mt-7 flex w-full items-center justify-between rounded-[var(--r-sm)] border px-4 py-3 transition-all ${
              sleptWell ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--border)] bg-[var(--bg-input)]"
            }`}
          >
            <span className="inline-flex items-center gap-2 text-sm text-[var(--text-1)]">
              <Moon className="h-4 w-4 text-[var(--primary)]" />
              {sleptWell ? "Slept well ✓" : "Restless"}
            </span>
            {sleptWell && <Check className="h-4 w-4 text-[var(--accent)]" />}
          </button>

          <label className="mt-7 block font-display text-sm font-semibold text-[var(--text-1)]">Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Anything your physio should know?"
            className="mt-3 w-full resize-none rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-input)] p-4 text-sm text-[var(--text-1)] outline-none transition-all placeholder:text-[var(--text-3)] focus:border-[var(--primary)] focus:shadow-[0_0_18px_var(--primary-glow)]"
          />

          <button onClick={submitCheckin} disabled={isSubmitting} className="btn-primary mt-6 w-full py-3 text-sm disabled:opacity-60">
            {isSubmitting ? "Generating insight..." : "Submit Check-in"}
          </button>
        </section>

        {insight && (
          <section className="card mt-5 border-[rgba(16,185,129,0.28)] bg-[rgba(16,185,129,0.08)] p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-dim)] font-display font-bold text-[var(--accent)]">
                G
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 font-display text-sm font-semibold text-[var(--text-1)]">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                  Gemini Insight
                </div>
                <p className="text-sm leading-6 text-[var(--text-2)]">{insight}</p>
              </div>
            </div>
          </section>
        )}

        <section className="card mt-5 p-5">
          <h2 className="font-display text-lg font-semibold text-[var(--text-1)]">7-Day History</h2>
          <div className="mt-4 flex items-center justify-between">
            {history.map((day, index) => {
              const dayTone = day ? painTone(day.pain) : null;
              return (
                <div key={index} className="group relative flex h-9 w-9 items-center justify-center">
                  <span
                    className="h-4 w-4 rounded-full border"
                    style={{
                      background: dayTone?.color ?? "transparent",
                      borderColor: dayTone?.color ?? "var(--text-3)",
                    }}
                  />
                  <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-1)] shadow-[var(--shadow-float)] group-hover:block">
                    {day ? `Pain ${day.pain}/10 · ${day.mood}` : "No check-in"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {showPainAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-md">
          <div className="alert-modal card max-w-md border-[rgba(239,68,68,0.3)] p-6 text-center shadow-[0_0_40px_var(--danger-glow)]">
            <div className="text-4xl">⚠️</div>
            <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--danger)]">High Pain Reported</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-2)]">
              You&apos;ve reported a pain score of <strong>{painScore}/10</strong>. We recommend resting today and contacting your physiotherapist before continuing.
            </p>
            <a href="tel:" className="btn-danger mt-6 inline-flex w-full justify-center px-6 py-3 text-sm">Call My Physiotherapist</a>
            <button onClick={() => setShowPainAlert(false)} className="btn-ghost mt-3 w-full px-6 py-3 text-sm">Continue Anyway</button>
          </div>
        </div>
      )}
    </main>
  );
}
