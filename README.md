# Tailor-fit

## Local API test

Create a `.env.local` file with:

```bash
LLM_PROVIDER=gemini
LLM_FALLBACK_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

`LLM_PROVIDER` can be `gemini` or `openai`. You only need the API key for the
active provider, so `GEMINI_API_KEY` is enough when `LLM_PROVIDER=gemini`, and
`OPENAI_API_KEY` is enough when `LLM_PROVIDER=openai`.

Gemini can occasionally return temporary `503` errors under high demand. The
Gemini provider retries transient failures before giving up, and
`LLM_FALLBACK_PROVIDER=openai` lets the API try OpenAI if Gemini still fails.
For best demo reliability, set both `GEMINI_API_KEY` and `OPENAI_API_KEY`. If
only one key is available, the app still runs with that provider.

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
