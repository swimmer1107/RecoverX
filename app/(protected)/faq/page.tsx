"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "ai";
  text: string;
  time: number;
};

const QUICK_QUESTIONS = [
  "Can I climb stairs yet?",
  "Why does my knee click?",
  "Is swelling normal at Week 3?",
  "When can I drive again?",
  "Can I sleep on my side?",
  "Why is my range of motion stuck?",
  "Is it normal to feel tired after sessions?",
];

const extractedData = {
  surgeryType: "Total Knee Replacement",
  surgeryDate: "2026-05-01",
  operatedSide: "RIGHT",
  prescribedExercises: [{ name: "Knee Flexion" }, { name: "Heel Slides" }, { name: "Quad Sets" }],
  restrictions: ["Avoid twisting on the operated knee", "No deep squats until cleared"],
  redFlags: ["Fever or wound drainage", "Sudden calf swelling", "Shortness of breath"],
  allowedROM: { min: 0, max: 90 },
};

const reportUploaded = true;

function formatTime(ms: number) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(ms));
}

function TypingIndicator() {
  return (
    <div className="msg-ai flex justify-start gap-3">
      <div className="ai-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-dim)] font-display font-bold text-[var(--primary)]">G</div>
      <div className="bubble rounded-[var(--r-lg)] rounded-bl bg-[var(--glass-bg)] px-4 py-3 text-[var(--text-2)]">
        <span className="inline-flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)] [animation-delay:240ms]" />
        </span>
      </div>
    </div>
  );
}

function fallbackAnswer(question: string) {
  const q = question.toLowerCase();
  if (q.includes("swelling")) return "Some swelling can be normal at Week 3, especially after exercise. Elevate, ice if advised, and watch for sudden worsening.";
  if (q.includes("stairs")) return "Stairs may be okay if your physiotherapist has cleared you. Use support, go slowly, and lead with the stronger leg.";
  if (q.includes("drive")) return "Driving depends on side, pain medicine, strength, and reaction time. Please ask your surgeon before returning to driving.";
  if (q.includes("range")) return "Range can plateau for a few days. Gentle consistency often helps more than forcing it.";
  return "That is a good recovery question. Keep it gentle, follow your prescribed plan, and ask your physiotherapist if symptoms change.";
}

export default function FAQPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Ask me about your recovery plan, exercises, pain, swelling, or what your report says.",
      time: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed, time: Date.now() }]);
    setIsLoading(true);
    setInput("");

    const reportContext = extractedData
      ? `Patient details from their uploaded report:
       Surgery: ${extractedData.surgeryType} on ${extractedData.surgeryDate}
       Side: ${extractedData.operatedSide}
       Prescribed exercises: ${extractedData.prescribedExercises?.map((e) => e.name).join(", ")}
       Restrictions: ${extractedData.restrictions?.join("; ")}
       Red flags: ${extractedData.redFlags?.join("; ")}
       Allowed ROM: ${extractedData.allowedROM?.min}°–${extractedData.allowedROM?.max}°`
      : "No medical report uploaded. Answer based on general AAOS 2022 post-surgery guidelines.";

    let text = fallbackAnswer(trimmed);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `You are AntiGravity's AI recovery assistant. ${reportContext}
Answer this patient's question: "${trimmed}"

Rules: Under 80 words. Warm, clear, reassuring. Reference their specific report if available.
Never diagnose or invent new exercises. If question is outside your scope, say so kindly.
Do NOT add a disclaimer at the end (it will be added automatically).`;
        const result = await model.generateContent(prompt);
        text = result.response.text().trim().replace(/[*_"]/g, "");
      } catch (error) {
        console.warn("Gemini FAQ answer skipped:", error);
      }
    }

    setMessages((prev) => [...prev, { role: "ai", text, time: Date.now() }]);
    setIsLoading(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion(input);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8">
      <div className="space-grid" />
      <div className="relative z-10 mx-auto max-w-5xl pb-12">
        <header className="mb-6">
          <p className="font-data text-xs uppercase tracking-[0.22em] text-[var(--primary)]">Page 9 / AI Coach FAQ</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--text-1)] md:text-4xl">AI Coach FAQ</h1>
        </header>

        <section className="mb-6">
          <p className="text-[var(--text-3)]">Common questions about your recovery:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                onClick={() => sendQuestion(question)}
                className="badge badge-blue cursor-pointer px-4 py-2 transition-transform hover:-translate-y-0.5"
              >
                {question}
              </button>
            ))}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div ref={chatRef} className="chat-container flex h-[480px] flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div key={`${msg.time}-${index}`} className={`${msg.role === "user" ? "msg-user justify-end" : "msg-ai justify-start gap-3"} flex`}>
                {msg.role === "ai" && (
                  <div className="ai-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-dim)] font-display font-bold text-[var(--primary)]">G</div>
                )}
                <div
                  className={`bubble max-w-[78%] px-4 py-3 text-sm leading-6 ${
                    msg.role === "user"
                      ? "rounded-[var(--r-lg)] rounded-br bg-[var(--primary-dim)] text-[var(--text-1)] border border-[var(--border-bright)]"
                      : "rounded-[var(--r-lg)] rounded-bl bg-[var(--glass-bg)] text-[var(--text-1)] border border-[var(--glass-border)]"
                  }`}
                >
                  {msg.role === "ai" && reportUploaded && <div className="badge badge-green mb-2 text-[10px]">Based on your report ✓</div>}
                  <p>{msg.text}</p>
                  {msg.role === "ai" && (
                    <p className="mt-2 border-t border-[var(--border)] pt-2 text-[11px] text-[var(--text-3)]">
                      ⚕ For specific medical advice, always consult your physiotherapist.
                    </p>
                  )}
                  <span className="mt-2 block text-[11px] text-[var(--text-3)]">{formatTime(msg.time)}</span>
                </div>
              </div>
            ))}
            {isLoading && <TypingIndicator />}
          </div>

          <form onSubmit={handleSubmit} className="chat-input flex gap-3 border-t border-[var(--border)] p-4">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything about your recovery..."
              className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)] focus:border-[var(--primary)]"
            />
            <button className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
              Send <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
