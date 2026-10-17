# SysDesign Studio: Design Details

Source: Penpot file, "Page 1" (five screens, 1280x800 each, plus a prototype flow named "Practice flow").

## Visual language

Dark, minimal. Font: Inter.

| Token | Hex | Use |
|---|---|---|
| bg | `#0F1117` | Page background |
| panel | `#171A23` | Header, sidebars, cards |
| panel2 | `#1E222E` | Inputs, chips, nodes |
| border | `#2A3042` | Dividers and outlines |
| text | `#E6E9F2` | Primary text |
| muted | `#8A93A8` | Secondary text |
| accent | `#6C8CFF` | Primary actions, active state |
| accent2 | `#34D399` | Success, Easy, strengths |
| warn | `#F5A524` | Medium, database nodes, warnings |
| danger | `#F87171` | Hard, cache nodes, gaps and risks |

Common elements: 56px header with logo, nav (Problems, Sessions, Settings) and an AI status indicator ("AI: Claude connected"); 8-12px corner radii; primary button in accent, secondary in panel2 with border.

## Screens

### 1. Home / Problems
- Title and subtitle, difficulty filter chips (All, Easy, Medium, Hard).
- Three-column grid of problem cards: title, difficulty pill, short description, Start button.
- Seeded problems: URL Shortener (Easy), Design Twitter (Medium), Ride Sharing (Hard), Chat Application (Medium), Rate Limiter (Easy), Video Streaming (Hard).

### 2. Workspace / Requirements
- Left stepper (220px): Requirements, Functional, Non-functional, Core entities, API endpoints, High-level design, Review. Active step highlighted. Session title and autosave status at top.
- Content: section title, hint, large text area.
- Right card: interviewer tips.
- Footer: Back and Next buttons.

### 3. Workspace / High-level design
- Left palette: Client, Load Balancer, API Gateway, Service, Database, Cache, Message Queue, Object Store, CDN.
- Toolbar: Select, Connect, Note, Undo, Redo, Export PNG.
- Canvas: nodes with colored accent bar, label and sub-note; labeled edges with arrowheads.
- Sample diagram: Client → Load Balancer → API Gateway → Shorten Service and Redirect Service; Shorten Service → Postgres (write), Redirect Service → Redis Cache (read), cache miss → Postgres, Key Gen service → Postgres.
- Node inspector card for the selected node with its note.
- Footer: Back and "Submit for review".

### 4. Settings
- Provider selector: Claude (active), Local LLM (disabled, "Coming soon").
- API key field (masked, Show toggle) with helper text: stored encrypted on this machine.
- Model field (default `claude-sonnet-5-5`).
- Actions: Test connection (with result status), Save, Remove key.

### 5. AI Review
- Overall score card (e.g. 3.8 / 5) with verdict pill ("Lean hire").
- Section score bars: Requirements, Entities, API design, High-level design, Non-functional.
- Three cards: Strengths, Gaps and risks, Suggested improvements.
- Actions: Back to design, Retry review, Try another problem.

## Prototype flow ("Practice flow", starts at Home)

- Home: Start (URL Shortener card) → Requirements
- Requirements: Next → Whiteboard; Back → Home; "High-level design" step → Whiteboard
- Whiteboard: Back → Requirements; Submit for review → Review; AI status → Settings
- Review: Back to design → Whiteboard; Try another problem → Home
- Nav "Settings" on Home and Whiteboard → Settings; "Problems" on Settings → Home

## Known gaps in the mock-ups

- Whiteboard connectors are thin rectangles with square arrowheads, standing in for real arrows.
- Only the first Home card, the first Requirements step transitions, and the links above are wired.
- Not yet designed: Functional/NFR lists, Core entities, API endpoints, sessions history, error and empty states.
