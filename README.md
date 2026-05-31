<div align="center">

<img src="https://img.shields.io/badge/RecoverX-AI%20Rehabilitation-0ea5e9?style=for-the-badge&logoColor=white" alt="RecoverX" height="40"/>

# 🦾 RecoverX

### AI-Powered Post-Surgery Rehabilitation Assistant

*Track. Analyze. Recover — Smarter.*

> Built at **HackDay Agra 2026** · Healthcare Track · Google × MLH

</div>

---

## 🩺 What is RecoverX?

**RecoverX** is an intelligent physiotherapy assistant that brings clinical-grade rehabilitation support to your home. Using your laptop camera, it tracks joint angles in real time, reads your surgeon's post-op report, and coaches you through every rep — all powered by AI.

No expensive equipment. No waiting rooms. Just guided, personalized recovery.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📷 **Real-Time Pose Tracking** | Detects and measures joint angles live via your webcam using MediaPipe BlazePose |
| 🧠 **AI Medical Reasoning** | Parses your surgeon's report with Google Gemini to generate a tailored exercise program |
| 🗣️ **Voice Coaching** | Gives rep-by-rep audio feedback so you can focus on form, not the screen |
| 📊 **Progress Dashboard** | Logs every session to Supabase and visualizes your recovery over time |
| 🔒 **Secure Auth** | Protected patient data with Supabase authentication |

---

## 🛠️ Tech Stack

```
Frontend       →  Next.js 14 + React + Tailwind CSS
AI / OCR       →  Google Gemini (medical report parsing + reasoning)
Pose Detection →  MediaPipe BlazePose (real-time joint angle tracking)
Database       →  Supabase (PostgreSQL + Auth + Storage)
Deployment     →  Vercel
Language       →  TypeScript (91.6%)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A webcam
- Supabase project
- Google Gemini API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/swimmer1107/recover-x-ten.git
cd recover-x-ten

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your keys (see below)

# 4. Start the development server
npm run dev
```

Open https://recover-x-ten.vercel.app/ in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Your Supabase anon/public key
NEXT_PUBLIC_GEMINI_API_KEY=      # Your Google Gemini API key
```

> See `.env.example` for the full template.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Click **Deploy** — you're live!

---

## ⚠️ Clinical Disclaimer

> RecoverX is a **rehabilitation support tool**. It does **not** replace the guidance of a licensed physiotherapist or orthopaedic surgeon. Always consult your healthcare provider before beginning or modifying any exercise program.

---

## 👥 Team

Built with ❤️ at HackDay Agra 2026


|---|
| **Pulkit Kulshreshtha** |
| **Gauri Singh** |
| **Varun Khandelwal** |

---

<div align="center">

🔗 **[recover-x-ten.vercel.app](https://recover-x-ten.vercel.app/)**

*RecoverX — Because recovery shouldn't stop at the hospital door.*

</div>
