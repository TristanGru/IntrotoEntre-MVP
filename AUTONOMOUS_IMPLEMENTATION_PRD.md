# AUTONOMOUS_IMPLEMENTATION_PRD.md

---

## 1. Title and One-Liner

**Product Name:** Hydra (placeholder — swap with final brand name)

**One-Liner:** A high-converting MVP landing page for an electrolyte-infused alcoholic beverage, featuring an interactive 3D bottle viewer and a lead-capture interest form that logs submissions to a local text file.

---

## 2. Executive Summary

- Single-page marketing site for an electrolyte-infused alcoholic drink targeting 21–30-year-olds.
- Features an interactive, rotatable 3D bottle model rendered via Three.js directly in the browser.
- Includes a lead-capture form collecting name, email, age confirmation, willingness-to-pay, and purchase context.
- Form submissions are saved server-side to a local `submissions.txt` file; this file is `.gitignore`d and never committed.
- A lightweight Node.js/Express backend handles form POST and file-append logic.
- Design aesthetic matches premium alcohol brand standards: dark, bold, modern, aspirational.
- No database. No third-party auth. No external data dependencies beyond a CDN for Three.js.
- Deployable locally or on any Node-capable server (Railway, Render, etc.).

---

## 3. Goals

- Capture 100+ form submissions within 30 days of launch.
- Achieve a landing page visit-to-submission conversion rate of ≥ 10%.
- Deliver a polished, brand-appropriate design that communicates the product value proposition clearly within 5 seconds of page load.
- Allow the team to qualitatively assess consumer interest through open-ended form responses.
- Ship a fully functional MVP with zero manual steps after `npm start`.

---

## 4. Non-Goals

- No user accounts, login, or authentication system.
- No database (PostgreSQL, MongoDB, SQLite, etc.).
- No payment processing or e-commerce functionality.
- No admin dashboard for viewing submissions (submissions are read directly from `submissions.txt`).
- No email delivery system (no confirmation emails sent to users).
- No A/B testing framework.
- No multi-page routing beyond the single landing page.
- No custom 3D bottle model at this stage — a programmatic placeholder bottle using Three.js geometry is sufficient.
- No mobile AR or WebXR features.

---

## 5. Assumptions & Decisions

### 5.1 Assumptions (A-###)

- **A-001:** The team will run this locally or deploy to a simple Node-hosting platform (e.g., Render free tier). No containerization (Docker) is required.
- **A-002:** The brand name, colors, and final copy can be substituted by editing clearly labeled constants/variables in the code. Placeholder brand name is "Hydra."
- **A-003:** Age gate is a simple checkbox ("I confirm I am 21 or older") — not a full DOB gate — sufficient for MVP purposes.
- **A-004:** The 3D bottle is a programmatic Three.js mesh (cylinder + sphere caps to suggest a bottle shape) with a placeholder label texture. A custom GLTF model can be dropped in later.
- **A-005:** Submissions file (`submissions.txt`) is stored in `/data/submissions.txt` relative to the project root and is `.gitignore`d.
- **A-006:** No rate limiting beyond a simple per-IP cooldown is needed at MVP scale.
- **A-007:** The site is English-only.
- **A-008:** Browser support targets: last 2 versions of Chrome, Firefox, Safari, Edge. No IE11.
- **A-009:** HTTPS is handled by the hosting platform, not the app itself.

### 5.2 Decisions (D-###)

- **D-001: Node.js + Express backend** — Lightest possible server to handle a single POST route and serve static files. Zero config overhead.
- **D-002: Vanilla HTML/CSS/JS frontend (no framework)** — Keeps the build pipeline simple (no Webpack, Vite, or React needed for a single marketing page). Faster for an autonomous agent to implement correctly.
- **D-003: Three.js via CDN** — No npm build step required for 3D. Loaded via `<script>` tag from cdnjs.cloudflare.com.
- **D-004: File-based submission storage** — Matches the explicit requirement of no database. `fs.appendFileSync` in Express writes each submission as a JSON line to `data/submissions.txt`.
- **D-005: CSS custom properties for theming** — All brand colors defined as CSS variables at the top of the stylesheet so they can be changed in one place.
- **D-006: GSAP via CDN for animations** — Lightweight scroll animations and entrance effects appropriate for a premium brand feel.

### 5.3 Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `submissions.txt` accidentally committed to Git | Add `/data/` to `.gitignore` immediately in Phase 1. Add a pre-commit hook check. |
| Three.js CDN unavailable | Pin to a specific version URL; add a fallback static message if WebGL is unsupported. |
| Form spam flooding the text file | Implement a simple server-side rate limit (1 submission per IP per hour) using an in-memory map. |
| Age gate bypassed | MVP-level checkbox is sufficient; note in docs that a production version needs a proper DOB gate. |
| File write permissions fail on deployment | Wrap `fs.appendFileSync` in try/catch; return a 500 with a clear error message; log to console. |
| Mobile 3D performance issues | Add a `prefers-reduced-motion` fallback; auto-disable auto-rotation on low-power devices detected via `navigator.hardwareConcurrency < 4`. |
| Copy/branding feels generic | All placeholder text is clearly labeled with `<!-- BRAND: -->` HTML comments for easy find-and-replace. |

---

## 6. Users, Personas, and Core Use Cases

### Personas

- **Alex, 22, College Senior** — Hears about the product on Instagram, wants to know what it is and if it's worth trying. Will sign up if the vibe feels right and the benefit is clear.
- **Jordan, 27, Young Professional** — Googles the brand after hearing about it at a bar. Wants to know if the science is real and what the price point will be. Will sign up to "be first."
- **The Team** — Reads `submissions.txt` after 30 days to analyze interest, willingness to pay, and use-case patterns.

### Primary Flows (U-###)

- **U-001: Discovery & Scroll** — User lands on page → sees hero with 3D bottle → scrolls through benefit sections → reaches form.
- **U-002: Form Submission** — User fills out form → clicks submit → sees success message → submission written to `submissions.txt`.
- **U-003: 3D Interaction** — User clicks/drags on bottle → bottle rotates on all axes → user releases → bottle resumes slow auto-rotation.
- **U-004: Age Gate** — User must check age confirmation checkbox before form submits. Unchecked = form blocked with inline error.

---

## 7. Requirements

### 7.1 Functional Requirements (FR-###)

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | The page shall render a full-screen hero section with a headline, subheadline, and CTA button that scrolls to the form. | P0 |
| FR-002 | The hero section shall contain an interactive 3D bottle rendered in a WebGL canvas via Three.js. | P0 |
| FR-003 | The 3D bottle shall auto-rotate slowly on the Y-axis when idle. | P0 |
| FR-004 | The user shall be able to click and drag the bottle to manually rotate it on X and Y axes. | P0 |
| FR-005 | The page shall include a "Why Hydro?" benefits section with at least 3 benefit cards. | P0 |
| FR-006 | The page shall include a lead-capture form with fields: Full Name, Email, Age Confirmation (checkbox), Willingness to Pay (multiple choice), and "Where would you drink this?" (multiple choice). | P0 |
| FR-007 | The form shall validate all required fields client-side before submission. | P0 |
| FR-008 | On form submission, the server shall append a JSON record to `data/submissions.txt`. | P0 |
| FR-009 | The form shall display a success message after valid submission without a full page reload. | P0 |
| FR-010 | The `data/submissions.txt` file shall be excluded from version control via `.gitignore`. | P0 |
| FR-011 | The page shall include a footer with a legal drinking age disclaimer. | P1 |
| FR-012 | The site shall be responsive and usable on screens from 375px to 1440px wide. | P1 |
| FR-013 | The server shall reject duplicate submissions from the same email address within a 24-hour window (in-memory check). | P1 |
| FR-014 | The server shall rate-limit form submissions to 1 per IP per hour. | P1 |
| FR-015 | If WebGL is not supported, the 3D canvas shall be replaced with a static product image placeholder. | P2 |

### 7.2 Non-Functional Requirements (NFR-###)

| ID | Requirement |
|---|---|
| NFR-001 | Page initial load (LCP) under 3 seconds on a standard broadband connection. |
| NFR-002 | Three.js canvas must run at ≥ 30fps on a mid-range laptop (Chrome, 2020 MacBook Air equivalent). |
| NFR-003 | All form inputs must be sanitized server-side before writing to file (strip HTML tags, limit field lengths). |
| NFR-004 | The server must not crash on malformed POST bodies — wrap all handlers in try/catch. |
| NFR-005 | The app must start with a single command: `npm start`. |
| NFR-006 | The codebase must pass ESLint with no errors before submission. |

### 7.3 Out of Scope Requirements

- Email confirmation or marketing automation.
- CMS or editable content management.
- Analytics integration (Google Analytics, Mixpanel, etc.).
- Multi-language support.
- Cookie consent banner (no tracking cookies used).
- Custom GLTF 3D model (placeholder geometry only).

---

## 8. Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| Total form submissions | 100 within 30 days | Count lines in `submissions.txt` |
| Conversion rate (visit → submit) | ≥ 10% | Manual: submissions / page views (from server logs) |
| Willingness to pay above target price | ≥ 60% of respondents | Parse `submissions.txt`, count relevant answers |
| Form error rate | < 5% of attempts | Server logs counting 400 vs 200 responses |
| Page load time | < 3s LCP | Chrome DevTools / Lighthouse audit |

---

## 9. System Architecture

### 9.1 High-Level Diagram (ASCII)

```
Browser (Client)
│
├── index.html         ← Single page, all sections
├── style.css          ← Premium dark theme
├── main.js            ← GSAP animations, scroll behavior
├── bottle.js          ← Three.js 3D bottle scene
└── form.js            ← Form validation + fetch POST
         │
         │  POST /api/submit (JSON)
         ▼
Express Server (server.js)
│
├── GET /              ← Serves index.html
├── GET /static/*      ← Serves CSS/JS/assets
├── POST /api/submit   ← Validates, sanitizes, appends to file
│         │
│         ▼
│   /data/submissions.txt  ← Newline-delimited JSON records
│                             (.gitignored)
└── Rate limiter (in-memory Map)
```

### 9.2 Component Responsibilities

| Component | Purpose | Inputs | Outputs | Dependencies |
|---|---|---|---|---|
| `server.js` | Express app entry point | HTTP requests | HTTP responses, file writes | express, fs, path |
| `index.html` | Page structure and all content sections | — | DOM | — |
| `style.css` | All visual styling, responsive layout, CSS variables | — | Styled DOM | — |
| `bottle.js` | Three.js scene: bottle mesh, lighting, camera, orbit controls | DOM canvas element | Animated WebGL canvas | Three.js (CDN) |
| `form.js` | Client-side form validation and AJAX submission | User input | POST to `/api/submit`, success/error UI | fetch API |
| `main.js` | GSAP scroll animations, section entrance effects | Scroll events | CSS class changes, tween animations | GSAP (CDN) |
| `/data/submissions.txt` | Persistent flat-file storage for form responses | Appended JSON lines | Readable submission log | fs module |

### 9.3 Runtime Model

1. User requests `/` → Express serves `index.html` with linked CSS/JS.
2. Browser loads Three.js and GSAP from CDN; local JS files initialize after DOM ready.
3. `bottle.js` creates a WebGL canvas, renders the bottle, starts the animation loop.
4. `main.js` registers GSAP ScrollTrigger observers for section animations.
5. User fills form → `form.js` validates → `fetch POST /api/submit` with JSON body.
6. Express receives POST → validates/sanitizes → checks rate limit and duplicate email → appends to `data/submissions.txt` → responds `200 { success: true }`.
7. `form.js` receives response → hides form → shows success message.

### 9.4 Error Handling Strategy

| Error Type | Handling |
|---|---|
| Invalid form data (client) | Inline field error messages, form not submitted |
| Invalid POST body (server) | 400 response `{ error: "Invalid submission" }` |
| Duplicate email (server) | 409 response `{ error: "Email already registered" }` |
| Rate limit exceeded | 429 response `{ error: "Too many requests" }` |
| File write failure | 500 response `{ error: "Server error, please try again" }`, console.error log |
| WebGL not supported | Static fallback image shown instead of canvas |

---

## 10. Tech Stack

### 10.1 Selected Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Backend framework | Express 4.x |
| Frontend | Vanilla HTML5 / CSS3 / ES6 JS (no framework) |
| 3D rendering | Three.js r128 (CDN) |
| Animations | GSAP 3.x (CDN) |
| Form submission | Native `fetch` API |
| Storage | Local flat file (`fs.appendFileSync`) |
| Linting | ESLint with eslint-config-airbnb-base |
| Testing | Jest + Supertest (API routes only) |

### 10.2 Why This Stack

- **Express + Vanilla JS:** Zero build pipeline. An autonomous agent can implement this completely without Webpack, Babel, or framework-specific patterns. Fewer moving parts = fewer failure modes.
- **Three.js via CDN:** Avoids npm build step for 3D. The r128 CDN URL is stable and well-documented.
- **Flat file storage:** Explicitly required. Simpler than SQLite, zero setup, zero dependencies.
- **GSAP via CDN:** Industry standard for scroll-driven marketing animations. Free tier is sufficient.

### 10.3 Alternatives Considered

- **React/Next.js:** Overkill for a single marketing page; adds unnecessary build complexity.
- **SQLite:** More robust than flat file but explicitly out of scope per requirements.
- **Vite + Vue:** Good DX but adds toolchain the autonomous agent must also configure correctly.

---

## 11. Data Design

### 11.1 Entities and Schemas

**Submission Record (written to `data/submissions.txt` as newline-delimited JSON)**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string (UUID v4) | Yes | Auto-generated server-side |
| `timestamp` | string (ISO 8601) | Yes | Auto-generated server-side |
| `ip_hash` | string (SHA256 of IP) | Yes | Hashed for privacy, not raw IP |
| `full_name` | string | Yes | Max 100 chars, stripped of HTML |
| `email` | string | Yes | Valid email format, max 254 chars |
| `age_confirmed` | boolean | Yes | Must be `true` or submission rejected |
| `willingness_to_pay` | string (enum) | Yes | One of: "under-5", "5-8", "8-12", "12-plus" |
| `drink_context` | string[] (enum) | Yes | One or more of: "bars", "parties", "home", "events", "tailgates" |
| `referral_source` | string | No | Max 200 chars, free text |

### 11.2 Migrations and Seeding Plan

- No migrations needed (no database).
- On server start, if `data/` directory does not exist, create it with `fs.mkdirSync('data', { recursive: true })`.
- If `data/submissions.txt` does not exist, it will be created on first write.

### 11.3 Example Records

```json
{"id":"a1b2c3d4-...","timestamp":"2025-03-12T14:22:00Z","ip_hash":"e3b0c4...","full_name":"Alex Johnson","email":"alex@example.com","age_confirmed":true,"willingness_to_pay":"8-12","drink_context":["bars","parties"],"referral_source":"Instagram"}
{"id":"b2c3d4e5-...","timestamp":"2025-03-12T14:35:00Z","ip_hash":"a1b2c3...","full_name":"Jordan Lee","email":"jordan@example.com","age_confirmed":true,"willingness_to_pay":"12-plus","drink_context":["events","tailgates"],"referral_source":""}
```

---

## 12. API and Interface Contracts

### 12.1 POST /api/submit

- **Route:** `POST /api/submit`
- **Auth:** None
- **Request Content-Type:** `application/json`

**Request Schema:**
```json
{
  "full_name": "string (required, max 100)",
  "email": "string (required, valid email)",
  "age_confirmed": "boolean (required, must be true)",
  "willingness_to_pay": "string (required, enum: under-5 | 5-8 | 8-12 | 12-plus)",
  "drink_context": "string[] (required, min 1 item, enum: bars | parties | home | events | tailgates)",
  "referral_source": "string (optional, max 200)"
}
```

**Success Response (200):**
```json
{ "success": true, "message": "You're on the list!" }
```

**Error Responses:**
```json
// 400 - Validation failure
{ "error": "Invalid submission", "details": ["email is required", "age_confirmed must be true"] }

// 409 - Duplicate email
{ "error": "This email is already registered." }

// 429 - Rate limited
{ "error": "Too many requests. Please try again later." }

// 500 - Server error
{ "error": "Something went wrong. Please try again." }
```

### 12.2 Authentication & Authorization Model

No authentication. The form submission endpoint is public. Rate limiting and duplicate email checking serve as the only abuse controls.

### 12.3 Rate Limiting / Abuse Prevention

- 1 submission per IP address per 60 minutes (in-memory `Map` keyed by IP, reset TTL on each window).
- Duplicate email check within the current in-memory session (loaded from `submissions.txt` on server start into a `Set`).
- All string inputs stripped of HTML tags and trimmed server-side.
- Field length limits enforced server-side (not just client-side).

---

## 13. Business Logic Rules

| ID | Rule |
|---|---|
| BL-001 | A submission is only written to file if ALL required fields pass validation AND `age_confirmed === true`. |
| BL-002 | Email addresses are normalized to lowercase before duplicate checking and storage. |
| BL-003 | The `ip_hash` field stores a SHA-256 hash of the raw IP — the raw IP is never written to disk. |
| BL-004 | If the `data/` directory does not exist on server start, it must be created before the first request is served. |
| BL-005 | Each submission is written as a single newline-terminated JSON string (NDJSON format). |
| BL-006 | The rate limit counter is per-IP, not per-email. Both checks run independently. |
| BL-007 | Auto-rotation of the 3D bottle pauses while the user is actively dragging and resumes 2 seconds after release. |

---

## 14. Edge Cases

| ID | Edge Case | Related FR | Handling |
|---|---|---|---|
| EC-001 | User submits form twice with same email | FR-013 | 409 response; form shows "already registered" message |
| EC-002 | User unchecks age confirmation | FR-004 | Client-side and server-side rejection with clear error |
| EC-003 | WebGL not available (old browser, GPU blocked) | FR-015 | Detect via `WebGLRenderingContext` check; show static bottle image |
| EC-004 | Very long strings submitted (injection attempt) | NFR-003 | Server enforces max length; strips HTML before writing |
| EC-005 | `data/` directory deleted while server is running | FR-008 | `mkdirSync` called inside the write handler, not just on startup |
| EC-006 | User on mobile tries to rotate bottle | FR-004 | Touch events (touchstart, touchmove) handled in `bottle.js` |
| EC-007 | Network failure during form POST | FR-009 | `fetch` catch block shows "Network error, please try again" |
| EC-008 | Multiple rapid clicks on submit button | FR-007 | Button disabled immediately on first click until response received |
| EC-009 | User has `prefers-reduced-motion` set | FR-003 | Auto-rotation disabled; GSAP animations skipped |

---

## 15. Observability

### 15.1 Logging

All logs to `console` (stdout). Format: `[TIMESTAMP] [LEVEL] MESSAGE {context}`.

Log on every:
- Server start: port, environment
- POST /api/submit: timestamp, ip_hash, outcome (success/duplicate/rate-limited/error)
- File write: success or failure with error message
- Server error: full stack trace

### 15.2 Metrics

The team can derive the following from server logs and `submissions.txt`:
- Total submission count: `wc -l data/submissions.txt`
- Submissions by willingness-to-pay tier: manual parse or `grep`
- Rate-limit hit frequency: count 429 log lines

### 15.3 Tracing

Not applicable at MVP scale.

### 15.4 Alerts

Not applicable at MVP scale.

---

## 16. Security and Privacy

- **Raw IPs never stored.** Only SHA-256 hashes written to disk.
- **HTML stripping.** All string inputs run through a simple tag-stripping function before storage.
- **No secrets in repo.** `.env.example` provided; `.env` is `.gitignore`d.
- **`data/submissions.txt` is `.gitignore`d.** Must be verified in Phase 1.
- **No eval() or dynamic code execution** anywhere in the codebase.
- **Content-Security-Policy header** set in Express to allow only self + CDN origins.
- **Helmet.js** used for standard HTTP security headers.
- **CORS:** Disabled (same-origin only); the frontend and backend are served from the same Express process.
- **PII:** Name and email are stored in the text file. The team is responsible for storing this file securely and not sharing it publicly.

---

## 17. Repository Blueprint

### 17.1 Folder Structure (TREE)

```
/hydra-mvp
├── .env.example
├── .env                        ← .gitignored
├── .gitignore
├── .eslintrc.js
├── package.json
├── package-lock.json
├── README.md
│
├── server.js                   ← Express app entry point
│
├── /src
│   ├── /public                 ← Static files served by Express
│   │   ├── index.html          ← Single page layout
│   │   ├── style.css           ← All styles, CSS variables, responsive
│   │   ├── main.js             ← GSAP scroll animations
│   │   ├── bottle.js           ← Three.js 3D bottle scene
│   │   ├── form.js             ← Form validation + fetch submit
│   │   └── /assets
│   │       ├── logo.svg        ← Placeholder brand logo (SVG)
│   │       └── bottle-fallback.png  ← Static image if WebGL fails
│
├── /data
│   └── submissions.txt         ← .gitignored, created at runtime
│
├── /tests
│   ├── server.test.js          ← Supertest API route tests
│   └── validation.test.js      ← Unit tests for validation helpers
│
└── /docs
    └── PRD.md                  ← This document
```

### 17.2 File Responsibilities

| File | Purpose |
|---|---|
| `server.js` | Initializes Express, mounts middleware (helmet, cors, json), serves `/public`, registers `POST /api/submit` handler, ensures `/data` dir exists on start |
| `src/public/index.html` | Full page HTML: hero, benefits section, form section, footer. All `<!-- BRAND: -->` copy is clearly labeled. |
| `src/public/style.css` | CSS custom properties for brand colors, dark theme, responsive grid, all component styles |
| `src/public/bottle.js` | Three.js scene setup: renderer, camera, lights, bottle geometry (CylinderGeometry + SphereGeometry caps), OrbitControls-style manual drag, auto-rotation loop, WebGL detection, touch support |
| `src/public/form.js` | Client-side validation, submit button state management, fetch POST, success/error UI rendering |
| `src/public/main.js` | GSAP ScrollTrigger registration for section entrance animations, prefers-reduced-motion check |
| `src/public/assets/logo.svg` | Simple SVG text-based placeholder logo |
| `src/public/assets/bottle-fallback.png` | A static PNG of a generic bottle for non-WebGL browsers |
| `tests/server.test.js` | Supertest tests for all POST /api/submit scenarios |
| `tests/validation.test.js` | Unit tests for the server-side sanitization/validation helper functions |

### 17.3 Environment Variables

```env
# .env.example

# Port for the Express server
PORT=3000

# Node environment
NODE_ENV=development

# Brand name (used in server logs)
BRAND_NAME=Hydro
```

### 17.4 Commands and Scripts

```json
// package.json scripts block
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest --runInBand",
  "lint": "eslint . --ext .js",
  "lint:fix": "eslint . --ext .js --fix"
}
```

| Command | Purpose |
|---|---|
| `npm install` | Install all dependencies |
| `npm start` | Start production server on PORT |
| `npm run dev` | Start dev server with auto-reload via nodemon |
| `npm test` | Run all Jest tests |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Auto-fix lint issues |

---

## 18. Testing Plan

### 18.1 Test Strategy

- **Unit tests** (`validation.test.js`): Pure functions for input sanitization and field validation.
- **Integration tests** (`server.test.js`): Full HTTP request/response cycle using Supertest. No mocking of the file system — tests write to `data/test-submissions.txt` (also `.gitignore`d) and clean up after.
- **No e2e browser tests** at MVP stage (manual QA sufficient).

### 18.2 Minimum Test Coverage Requirements

- `POST /api/submit` with valid data → 200
- `POST /api/submit` with missing required field → 400
- `POST /api/submit` with `age_confirmed: false` → 400
- `POST /api/submit` with invalid email → 400
- `POST /api/submit` with duplicate email → 409
- `POST /api/submit` from rate-limited IP → 429
- `POST /api/submit` causes correct JSON appended to file
- Sanitization: HTML tags stripped from name field
- Sanitization: Email normalized to lowercase

### 18.3 Acceptance Tests (AT-###)

| ID | Test | Steps | Expected Result |
|---|---|---|---|
| AT-001 | Page loads | Navigate to `http://localhost:3000` | Page renders with hero, 3D canvas visible, no console errors |
| AT-002 | 3D bottle auto-rotates | Load page, observe canvas for 3 seconds | Bottle rotates slowly on Y-axis |
| AT-003 | 3D bottle manual rotation | Click and drag on canvas | Bottle rotates in direction of drag |
| AT-004 | Benefits section visible | Scroll down past hero | At least 3 benefit cards animate in |
| AT-005 | Form validation - empty submit | Click submit with empty form | All required fields show error messages |
| AT-006 | Form validation - bad email | Enter "notanemail" in email field | Email field shows "invalid email" error |
| AT-007 | Form validation - age not confirmed | Leave age checkbox unchecked, fill all other fields | Submission blocked, checkbox shows error |
| AT-008 | Successful form submission | Fill all fields correctly, submit | Success message shown, form hidden |
| AT-009 | Submission written to file | Complete AT-008, then `cat data/submissions.txt` | Last line contains valid JSON with submitted data |
| AT-010 | Duplicate email rejected | Submit AT-008 email a second time | Error message "email already registered" shown |
| AT-011 | Mobile responsiveness | Open in Chrome DevTools 375px width | No horizontal scroll, all sections readable, form usable |
| AT-012 | Lighthouse score | Run Lighthouse on localhost | Performance ≥ 80, Accessibility ≥ 90 |

---

## 19. Implementation Plan

### Phase 1: Scaffold & Foundations

**Goals:** Repo setup, server skeleton, static file serving, `.gitignore` verified.

**Deliverables:**
- Initialize `package.json` with all dependencies.
- Create `.gitignore` including `.env`, `data/`, `node_modules/`.
- Create `.env.example`.
- Create `server.js` with Express serving `/src/public` as static files.
- Create `data/` directory creation logic on server start.
- Create empty placeholder files: `index.html`, `style.css`, `main.js`, `bottle.js`, `form.js`.
- Confirm `npm start` runs without errors and serves `index.html`.

**Files to create:** `package.json`, `server.js`, `.gitignore`, `.env.example`, all `/src/public/` placeholders.

**Tests to add:** None yet.

**Exit criteria:** `npm start` → `GET /` → 200 with HTML shell.

---

### Phase 2: Core API (Form Submission Endpoint)

**Goals:** Full `POST /api/submit` implementation with validation, sanitization, file write, rate limiting.

**Deliverables:**
- Implement all validation and sanitization helper functions in `server.js`.
- Implement `POST /api/submit` route with all BL rules applied.
- Implement in-memory rate limiter and duplicate email set.
- Implement `fs.appendFileSync` write with `mkdirSync` guard.
- Write all tests in `tests/server.test.js` and `tests/validation.test.js`.

**Files to create/modify:** `server.js`, `tests/server.test.js`, `tests/validation.test.js`.

**Tests to add:** All items from Section 18.2.

**Exit criteria:** `npm test` passes all API tests.

---

### Phase 3: Core UI

**Goals:** Complete HTML/CSS page and all three JS modules.

**Deliverables:**
- `index.html`: Hero section, benefits section (3 cards), form section, footer with legal disclaimer. All `<!-- BRAND: -->` labels on copy.
- `style.css`: CSS variables for colors, dark background theme, responsive grid (mobile-first), all component styles, smooth scroll.
- `bottle.js`: Three.js scene with placeholder bottle (CylinderGeometry body + SphereGeometry top cap), ambient + directional lighting, mouse drag rotation (OrbitControls-style manual implementation — no external controls lib needed), auto-rotation loop, WebGL detection + fallback.
- `form.js`: Client-side validation for all fields, submit button disable-on-click, fetch POST to `/api/submit`, success/error UI.
- `main.js`: GSAP ScrollTrigger for benefits cards and form section entrance, `prefers-reduced-motion` check.
- Placeholder `logo.svg` and `bottle-fallback.png`.

**Files to create/modify:** All `/src/public/` files.

**Tests to add:** Manual QA using acceptance tests AT-001 through AT-011.

**Exit criteria:** Full page renders correctly at 375px and 1440px. Form submits successfully and writes to file. Bottle rotates and responds to drag. GSAP animations play on scroll.

---

### Phase 4: Edge Cases + Security + Performance

**Goals:** Handle all EC-### cases. Harden server. Improve performance.

**Deliverables:**
- Touch events added to `bottle.js` (EC-006).
- Network error handling in `form.js` (EC-007).
- Double-submit prevention (EC-008).
- `prefers-reduced-motion` behavior in `main.js` and `bottle.js` (EC-009).
- Helmet.js CSP header configured to allow CDN sources.
- String length limits enforced server-side.
- HTML stripping confirmed working in tests.

**Files to create/modify:** `server.js`, `bottle.js`, `form.js`, `main.js`.

**Tests to add:** Edge case tests for EC-004, EC-007, EC-008.

**Exit criteria:** All EC-### cases handled. `npm test` still passes. No console errors in browser.

---

### Phase 5: Observability + Polish + Final QA

**Goals:** Structured logging, final visual polish, Lighthouse audit, full checklist review.

**Deliverables:**
- Structured console logging in `server.js` (all log events from Section 15.1).
- Visual polish pass: typography, spacing, hover states, button animations.
- README.md with setup instructions, `npm start`, and note about `data/submissions.txt`.
- Run Lighthouse: fix any issues to hit ≥ 80 Performance, ≥ 90 Accessibility.
- Confirm `data/submissions.txt` not in `.gitignore` exception (double-check).
- Run all acceptance tests AT-001 through AT-012.

**Files to create/modify:** `server.js` (logging), `style.css` (polish), `README.md`.

**Tests to add:** Final manual AT run. Lighthouse audit documented.

**Exit criteria:** All acceptance tests pass. Lighthouse scores met. Final checklist (Section 20) fully checked.

---

## 20. Final Checklist

Before declaring "done," the autonomous engineer must verify every item:

- [ ] `npm install` completes without errors
- [ ] `npm start` starts server and serves page on configured PORT
- [ ] `npm test` passes all tests with zero failures
- [ ] `npm run lint` returns zero errors
- [ ] `.gitignore` includes: `node_modules/`, `.env`, `data/`
- [ ] `data/submissions.txt` does NOT exist in git history
- [ ] Page renders correctly at 375px mobile width (no horizontal scroll)
- [ ] Page renders correctly at 1440px desktop width
- [ ] 3D bottle auto-rotates on load
- [ ] 3D bottle responds to mouse drag rotation
- [ ] 3D bottle responds to touch drag on mobile
- [ ] WebGL fallback image appears when WebGL is blocked
- [ ] Form blocks submission if any required field is empty
- [ ] Form blocks submission if email is invalid format
- [ ] Form blocks submission if age checkbox is unchecked
- [ ] Successful form submission shows success message (no page reload)
- [ ] Successful submission writes valid JSON to `data/submissions.txt`
- [ ] Duplicate email returns 409 and appropriate UI message
- [ ] Rate limit returns 429 after 1 submission per IP per hour
- [ ] `prefers-reduced-motion` disables bottle auto-rotation and GSAP animations
- [ ] Lighthouse Performance score ≥ 80
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] No `console.error` output on normal page load and submission
- [ ] All `<!-- BRAND: -->` placeholder copy is clearly labeled for easy replacement
- [ ] README.md explains setup, how to start, and where submissions are stored

---

## 21. Open Questions

- **Brand name:** "Hydro" is a placeholder. Replace everywhere before launch.
- **Brand colors:** Default palette is deep navy + electric teal + off-white. Confirm or override via CSS variables in `style.css`.
- **Custom 3D bottle model:** When the team has a GLTF file, replace the `CylinderGeometry` placeholder in `bottle.js` with a `GLTFLoader` import. The swap point is clearly labeled in the code.
- **Deployment target:** Assumed to be Render or Railway free tier. If deploying to a read-only filesystem (e.g., some serverless platforms), the flat-file approach will not work and a simple database or third-party form service will be needed.
- **Legal drinking age disclaimer:** Confirm exact legal disclaimer language with the team before launch.
