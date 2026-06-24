# Tailor-fit

## Local API test

Create a `.env.local` file with:

```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.0-flash

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
```

Tailor Fit is Gemini-first. `GEMINI_API_KEY` is enough for the default setup,
and Gemini will use `GEMINI_MODEL` first. If transient high-demand errors keep
happening, it can try `GEMINI_FALLBACK_MODEL` once with the same Gemini key.

Gemini can occasionally return temporary `503` errors under high demand. The
Gemini provider retries transient failures before giving up on the primary
model. OpenAI support still exists for optional local experiments if
`LLM_PROVIDER=openai`, but it is not required for normal Gemini use.

Start the dev server:

```bash
npm install
npm run dev
```

Then test the Phase 1 tailor endpoint:

```bash
curl -X POST http://localhost:3000/api/tailor \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "Jane Doe\n\nExperience\n- Project Manager, Acme Corp, 2021-2024\n- Managed delivery timelines for software projects and coordinated designers, engineers, and stakeholders.\n- Improved sprint planning by documenting risks, tracking blockers, and keeping teams aligned.\n\nEducation\n- B.S. Business Administration, State University, 2020",
    "jobDescription": "We are hiring a Technical Project Manager to lead cross-functional software initiatives. The role requires stakeholder communication, roadmap coordination, risk tracking, and experience partnering with engineering and design teams to deliver projects on schedule."
  }'
```
