# CVForge AI

AI-powered CV / resume builder with built-in templates, live A4 preview, local document storage, template selection, and a secure server-side AI endpoint.

## Current foundation

- Next.js App Router + React + TypeScript
- My CVs dashboard
- Multiple CV documents
- Six built-in templates
- Live A4 CV preview
- Responsive editor
- Experience, education, skills and project-ready data model
- AI Assistant UI
- Secure `/api/ai` endpoint using the OpenAI Responses API
- No API key exposed to the browser

## Run locally

```bash
npm install
npm run dev
```

For AI features, create `.env.local`:

```env
OPENAI_API_KEY=your_server_side_key
OPENAI_MODEL=gpt-5.6-luna
```

The AI endpoint is intentionally server-side so the secret is never shipped to the client.

## Product roadmap

1. Real AI writing actions connected to the editor
2. Job-description analyzer and ATS scoring
3. Custom Template Studio with drag/drop sections
4. Database/authentication and cloud sync
5. PDF/DOCX export pipeline
6. Profile photo/file storage
7. Admin template management
8. Subscription/credit system
9. Template sharing / marketplace

## Branch

The first implementation is being developed on `ai-cv-builder` so the original quotation application remains untouched on `main`.
