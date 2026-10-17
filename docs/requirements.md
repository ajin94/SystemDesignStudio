# SysDesign Studio: Requirements and Initial Research

## 1. Summary

A web application that runs on the user's local machine for practicing system design and preparing for interviews. The user works through a problem on a whiteboard, then submits the design and an AI reviews it.

## 2. Original requirement

- Web-based, runs locally on the user's machine.
- The user sees a whiteboard on which they create the HLD for a given system.
- The user can add:
  - Requirements
  - Functional requirements
  - Non-functional requirements
  - Core entities
  - API endpoints
  - The system design drawing
- Once complete, the user submits and an AI reviews the proposed design.
- A settings UI lets the user enter the AI key, persisted on the local system.
- Initially the app connects to Claude. Later, users can connect a local LLM.

## 3. Name

**SysDesign Studio.** A web search found no product, app or repo with this exact name.

Related names found (for awareness, no conflict identified):
- SysDesignLab: interactive system design learning platform
- System Designer: open-source low-code tool (Erwan Carriou)
- System Design Studio: a design firm; the University of Toronto runs a "Systems Design Studio" lab

Before committing, still check GitHub, npm and a domain registrar.

## 4. Scope (v1)

In scope:
- Problem library with seeded classic problems
- Session workspace: Requirements, Functional, Non-functional, Core entities, API endpoints, High-level design (whiteboard), Review
- Whiteboard with a system-design node palette and connectable edges
- AI review with structured feedback
- Settings screen with local, persisted API key
- Local persistence of sessions and reviews

Out of scope for v1: multi-user collaboration, accounts, timed mock-interview mode, local LLM provider (planned later).

## 5. Functional requirements

1. Browse and filter problems by difficulty and start a session.
2. Capture free-form requirements.
3. Manage lists of functional and non-functional requirements (NFRs may carry a target).
4. Define core entities (name, description, fields).
5. Define API endpoints (method, path, request/response sketch, description).
6. Draw the HLD on a whiteboard: drag components from a palette, connect and label edges, add notes to nodes, undo/redo, export PNG.
7. Autosave sessions locally and resume them later.
8. Submit a session for AI review; view scores, strengths, gaps and suggested improvements.
9. Keep a history of reviews per session.
10. Configure the AI provider and key in a Settings UI; test the connection.

## 6. Non-functional requirements

- Runs entirely on the user's machine; data stays local.
- The API key is never held in browser storage and never returned in full by any API.
- Server binds to localhost only and rejects foreign origins.
- Provider-neutral review pipeline so a local LLM can be added without UI changes.
- Review responses are validated against a schema; malformed output triggers one repair retry.
- Single command to start the app in development.

## 7. Proposed technical approach

Chosen defaults (changeable):

| Area | Choice |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Node + Express, bound to 127.0.0.1 |
| Whiteboard | React Flow with a system-design node palette (the AI receives a structured graph) |
| Storage | SQLite (`better-sqlite3`), file at `data/app.db` |
| AI (v1) | Claude API |
| Shared types | Zod schemas shared by client, server and AI output validation |

Architecture:

```
Browser (React + Vite + TS)
  ├─ Zustand store (session)
  ├─ React Flow whiteboard
  └─ REST ──► Express (localhost:3001)
                ├─ /api/problems
                ├─ /api/sessions            CRUD + autosave (SQLite)
                ├─ /api/sessions/:id/review ──► LLM provider
                └─ /api/settings            provider, model, encrypted key
```

### Data model
- `problems(id, title, prompt, difficulty, tags)`
- `sessions(id, problem_id, title, created_at, updated_at, status: draft|submitted)`
- `session_content`: JSON blob with requirements, functional, nonFunctional, entities, apis, diagram `{nodes, edges}`
- `reviews(id, session_id, snapshot_json, result_json, model, created_at)`
- `settings`: provider, model, encrypted key

### Settings and key storage
- Key stored server-side in SQLite, encrypted with AES-256-GCM; the encryption key is generated on first run in `data/.secret` (mode 0600). This protects against casual disclosure, not against someone with full access to the user's account.
- Optional later upgrade: OS keychain, with fallback to the encrypted file.
- Endpoints: `GET/PUT /api/settings`, `DELETE /api/settings/key`, `POST /api/settings/test`. `GET` returns only a masked hint.
- Secrets are redacted from logs.
- `ANTHROPIC_API_KEY` env var is used as fallback when no key is saved.

### Provider abstraction
```ts
interface LLMProvider {
  id: 'claude' | 'local';
  testConnection(): Promise<void>;
  review(input: ReviewRequest): AsyncIterable<ReviewChunk> | Promise<ReviewResult>;
}
```
- v1: `ClaudeProvider` only.
- Later: `LocalProvider` for any OpenAI-compatible endpoint (Ollama, LM Studio, llama.cpp, vLLM): base URL, model, optional key.
- Prompt builder and result schema live above the provider; providers only handle transport.

### AI review output
Structured JSON: overall score (1-5) with hire-signal verdict, per-section scores and comments (requirements, entities, API, HLD, non-functional), strengths, gaps and risks, prioritized improvements, likely follow-up questions, and a short reference outline. The diagram is sent as an adjacency list.

## 8. Milestones

| # | Milestone | Outcome |
|---|---|---|
| 1 | Scaffold | Monorepo, Vite + Express, shared Zod types, SQLite (including settings table and crypto helper), one-command dev run |
| 2 | Problem library and sessions | Home with problem list and "my sessions", create/resume, autosave |
| 3 | Text sections | Requirements, FR, NFR, entities and API forms with validation |
| 4 | Whiteboard | React Flow canvas, palette, node and edge editing, undo/redo, PNG export |
| 5a | Settings | Settings UI, encrypted key storage, Test connection |
| 5b | AI review | Submit flow, prompt, structured output, review UI, attempt history |
| 6 | Polish | Themes, shortcuts, empty/error states, README |
| 7 | Tests | Schema and prompt-builder unit tests, API tests with mocked AI client, key-leak and origin-check tests, Playwright smoke test |
| 8 (later) | Local LLM | `LocalProvider`, settings form, model discovery |

## 9. Risks and open points

- Review quality depends on the rubric prompt; iterate against good and deliberately flawed sample designs.
- Small local models may not return reliable JSON; schema validation with a repair retry is designed in from the start.
- Open: OS keychain versus encrypted file for v1 (encrypted file assumed).
