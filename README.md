# Tailor Fit

Tailor Fit rewrites a resume against a target job description while keeping the user's real experience intact.

## Live Demo

[Open Tailor Fit on Vercel](https://tailor-gbaadqh74-itzpranav61s-projects.vercel.app/)

## Why It Is Different

Most resume tools try to optimize for keywords first. Tailor Fit is honesty-first: it can rephrase supported experience to better match a role, but it should not invent skills, tools, titles, metrics, or work the user did not provide.

The app returns two things:

- A tailored resume draft
- Change notes explaining what changed and why

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Google Gemini via `@google/genai`
- OpenAI SDK support kept optional
- Zod request validation

## Local Setup

1. Clone the repository:

```bash
git clone https://github.com/ItzPranav61/Tailor-fit.git
cd Tailor-fit
```

2. Install dependencies:

```bash
npm install
```

3. Create a local environment file from the example:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

4. Edit `.env.local` and set your Gemini key:

```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.0-flash

OPENAI_API_KEY=your_openai_api_key_here_optional
OPENAI_MODEL=gpt-5.4-mini
```

For the default Gemini setup, only `GEMINI_API_KEY` is required. OpenAI support exists for optional local experiments if `LLM_PROVIDER=openai`, but it is not required.

Tailor Fit uses the real Gemini API by default. If Gemini returns a confirmed
quota or rate-limit `429`, the app may show a clearly labeled offline demo
fallback so the hackathon flow remains reviewable. That fallback only triggers
when the built-in Try Example demo was used, and it is not a replacement for the
real AI tailoring path.

5. Start the dev server:

```bash
npm run dev
```

6. Open the app:

[http://localhost:3000](http://localhost:3000)

## API Test

The frontend is the main demo surface, but the tailoring endpoint can also be tested directly:

```bash
curl -X POST http://localhost:3000/api/tailor \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "Jane Doe\n\nExperience\n- Project Manager, Acme Corp, 2021-2024\n- Managed delivery timelines for software projects and coordinated designers, engineers, and stakeholders.\n- Improved sprint planning by documenting risks, tracking blockers, and keeping teams aligned.\n\nEducation\n- B.S. Business Administration, State University, 2020",
    "jobDescription": "We are hiring a Technical Project Manager to lead cross-functional software initiatives. The role requires stakeholder communication, roadmap coordination, risk tracking, and experience partnering with engineering and design teams to deliver projects on schedule."
  }'
```

## Environment Variables

See `.env.example` for the full list.

- `LLM_PROVIDER`: defaults to Gemini usage in local setup
- `GEMINI_API_KEY`: required for the default Gemini provider
- `GEMINI_MODEL`: primary Gemini model
- `GEMINI_FALLBACK_MODEL`: optional Gemini fallback model
- `OPENAI_API_KEY`: optional, only needed if using OpenAI locally
- `OPENAI_MODEL`: optional OpenAI model setting

Real `.env` and `.env.local` files are ignored by git.

## Known Limitations

- Gemini free-tier models can return temporary rate-limit or high-demand errors.
- The fallback model uses the same Gemini API key, so it can still fail if that key has no quota for the fallback model.
- If Gemini quota is exhausted, Tailor Fit can return a clearly labeled offline
  demo fallback only for the built-in Try Example demo.
- Tailor Fit does not store resumes, add authentication, or provide file upload in this MVP.
- The AI output should still be reviewed by the user before sending a job application.

## Hackathon

Built for CodeStorm 2026 #2.
