# RecoverX — AI Post-Surgery Rehabilitation

AI-powered physiotherapy assistant that tracks joint angles through your laptop camera, reads your surgeon's report, and coaches you through every rep by voice in real time.

## Built At

HackDay Agra 2026 · Healthcare Track · Google × MLH

## Tech Stack

- Next.js 14 + React
- Google Gemini AI (OCR + Medical Reasoning)
- MediaPipe BlazePose (Pose Tracking)
- Supabase (Database + Auth)
- Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your keys
4. Run the development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for required variables.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Google Gemini API key |

## Deploying to Vercel

1. Push the repository to GitHub
2. Import the project on [Vercel](https://vercel.com/new)
3. Add the environment variables from `.env.example` in the Vercel dashboard
4. Deploy

## Clinical Disclaimer

RecoverX is a rehabilitation support tool. It does not replace the guidance of a licensed physiotherapist or orthopaedic surgeon. Always consult your healthcare provider before beginning or modifying any exercise program.
