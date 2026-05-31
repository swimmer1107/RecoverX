<div align="center">

# 🦾 RecoverX

### AI-Powered Post-Surgery Rehabilitation Assistant

*Track. Analyze. Recover — Smarter.*

[![RecoverX](https://img.shields.io/badge/RecoverX-AI%20Rehabilitation-0ea5e9?style=for-the-badge&logoColor=white)](https://recover-x-ten.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-91.6%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=for-the-badge&logo=vercel)](https://recover-x-ten.vercel.app/)

> Built at **HackDay Agra 2026** · Healthcare Track · Google × MLH

**[🌐 Live Demo](https://recover-x-ten.vercel.app/)**

</div>

---

## 🩺 What is RecoverX?

**RecoverX** is an intelligent physiotherapy assistant that brings clinical-grade rehabilitation support to your home. Using your laptop camera, it tracks joint angles in real time, reads your surgeon's post-op report, and coaches you through every rep — all powered by AI.

No expensive equipment. No waiting rooms. Just guided, personalized recovery.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📷 **Real-Time Pose Tracking** | Measures joint angles live via webcam using MediaPipe BlazePose |
| 🧠 **AI Medical Reasoning** | Parses your surgeon's report with Google Gemini to generate a tailored exercise program |
| 🗣️ **Voice Coaching** | Delivers rep-by-rep audio feedback so you stay focused on form, not the screen |
| 📊 **Progress Dashboard** | Logs every session to Supabase and visualizes your recovery over time with Recharts |
| 🗺️ **Physiotherapist Finder** | Integrated map (Leaflet) to locate nearby physio clinics |
| 🔒 **Secure Auth** | Patient data protected via Supabase authentication |
| 📂 **Report Upload** | Drag-and-drop interface for uploading post-operative PDF/image reports |

---

## 🛠️ Tech Stack

```
Frontend         →  Next.js 14 · React 18 · Tailwind CSS · Framer Motion
AI / LLM         →  Google Gemini (@google/generative-ai)
Pose Detection   →  MediaPipe BlazePose (@mediapipe/tasks-vision)
3D Rendering     →  Three.js · React Three Fiber · Drei
Database & Auth  →  Supabase (PostgreSQL + Auth + Storage)
ORM              →  Prisma
Charts           →  Recharts
Maps             →  Leaflet · react-leaflet
Utilities        →  date-fns · clsx · tailwind-merge · react-dropzone
Deployment       →  Vercel
Language         →  TypeScript (91.6%)
```

---

## 📁 Project Structure

```
RecoverX/
├── app/                  # Next.js App Router pages & API routes
├── .env.example          # Environment variable template
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vercel.json           # Vercel deployment settings
└── package.json          # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- A **webcam**
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google Gemini](https://aistudio.google.com/app/apikey) API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/swimmer1107/RecoverX.git
cd RecoverX

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your keys (see below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


## ☁️ Deploying to Vercel

1. Push your repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Click **Deploy** — you're live!

---

## 🧰 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## ⚠️ Clinical Disclaimer

> RecoverX is a **rehabilitation support tool**. It does **not** replace the guidance of a licensed physiotherapist or orthopaedic surgeon. Always consult your healthcare provider before beginning or modifying any exercise program.

---

## 👥 Team

| Name |
|---|
| Pulkit Kulshreshtha |
| Gauri Singh |
| Varun Khandelwal |

---

## 📄 License

This project is open source. Feel free to fork, contribute, and build on top of it.

---

<div align="center">

🔗 **[recover-x-ten.vercel.app](https://recover-x-ten.vercel.app/)**

*RecoverX — Because recovery shouldn't stop at the hospital door.*

</div>
