---
project_name: 'MockAI-Interview'
user_name: 'ADMIN'
date: '2026-06-28'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 24
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Frontend
- **React**: v19.2.5 (React 19 compatibility is strictly required; avoid legacy lifecycle or class components)
- **Vite**: v8.0.10 (Bundler and dev server)
- **Tailwind CSS**: v4.3.0 (Configured via `@tailwindcss/vite` plugin; use modern v4 directives. Do NOT create `tailwind.config.js` or `postcss.config.js`)
- **Zustand**: v5.0.13 (Used exclusively for client-side UI/Auth state)
- **TanStack Query** (React Query): v5.100.9 (Used for all server state, caching, and synchronization)
- **Framer Motion**: v12.38.0 & **GSAP** v3.15.0 (Animations)
- **Three.js / React Three Fiber**: v0.184.0 / v9.6.1 (Interactive 3D avatar visualization)
- **Socket.io Client**: v4.8.3 (Real-time communication)
- **Axios**: v1.16.0 (HTTP requests client)

### Backend
- **Node.js**: v18+ / v20+
- **Express**: v5.2.1 (REST APIs framework)
- **PostgreSQL**: v8.20.0 (pg client)
- **Knex.js**: v3.2.10 (SQL query builder and migration runner)
- **Socket.io**: v4.8.3 (Real-time gateway)
- **Redis**: v6.0.0 (Caching layers to optimize performance and reduce DB load)
- **Bcryptjs**: v3.0.3 & **Jsonwebtoken** v9.0.3 (Authentication and hashing)
- **Cloudinary / Multer**: v2.10.0 / v2.1.1 (File upload and cloud storage)
- **Generative AI (@google/generative-ai)**: v0.24.1 (AI evaluation and interview question generation)
- **PDF Parse / PDFKit**: v1.1.1 / v0.18.0 (CV data extraction and PDF report exporting)

---

## Critical Implementation Rules

### Language-Specific Rules
- **ES6+ ESM Modules**: All backend and frontend code must use ESM imports/exports (`import ... from ...` instead of `require()`).
- **Async/Await Error Handling**: Always wrap asynchronous calls in try/catch blocks. Do not swallow errors; log them properly or pass them to Express error middlewares.
- **Strict Linting Enforcement**: Every frontend modification must pass linting. Always run `pnpm -C frontend run lint` to fix warnings/errors before declaring a task complete.

### Framework-Specific Rules
- **Zustand vs TanStack Query Separation**:
  - **Zustand**: Strictly limited to UI state (e.g. modals, active sidebar tabs, light/dark themes) and authentication tokens.
  - **TanStack Query**: Must handle all server-derived data (jobs, CV details, application lists, interview questions). Do NOT sync or save server data inside Zustand stores.
- **Audio Streaming over Socket.io**:
  - Implement chunk-by-chunk real-time streaming of audio rather than sending whole audio files to minimize latency.
  - Compress audio streams using formats like WebM/Opus.
- **Three.js & R3F (React Three Fiber) Performance**:
  - Wrap R3F 3D avatar canvas in `<Suspense fallback={<WebcamFallback />}>` to avoid visual layout shifts.
  - Implement Web Workers for MediaPipe `FaceLandmarker` facial expression computations to avoid blocking the main UI thread.

### Testing Rules
- **Automatic Lint Testing**: The workspace uses `eslint` and `pnpm lint`. No commit or build should go through with lint errors.
- **Stubbed Testing**: Keep backend and frontend test scripts executing clean stubs (`echo ...`) unless actual unit tests are implemented.

### Code Quality & Style Rules
- **Naming Conventions**:
  - **React Components**: `PascalCase` with `.jsx` extension (e.g. `InterviewSession.jsx`, `ManageBlog.jsx`).
  - **Hooks & Stores**: `camelCase` starting with `use` (e.g. `useAuthStore.js`, `useGazeTracker.js`).
  - **APIs, Controllers & Routes**: `camelCase` (e.g. `axiosClient.js`, `authController.js`, `jobRoutes.js`).
- **Styling Standards**:
  - Primary color palette is **Ocean Blue**: `#0ea5e9` (primary) and `#38bdf8` (secondary).
  - DO NOT use purple or violet as primary colors.
  - Adhere to the 8-point grid layout system for margins/paddings.

### Development Workflow Rules
- **Auth Gate Protocol**:
  - Unauthenticated users can ONLY access the Landing Page (`/`).
  - Access to other routes (e.g. `/jobs`, `/hr/dashboard`, `/profile`) must be intercepted: block navigation, show Toast notification ("Yêu cầu đăng nhập để dùng được tính năng này"), and DO NOT automatically pop up the login modal.
  - Backend sensitive endpoints must use JWT verification middleware (`authMiddleware.js`).
- **Database Migrations**:
  - Always write clean migrations and rollback configurations in Knex.

### Critical Don't-Miss Rules (Wow Features & Guardrails)
- **Real-Time Interview Anti-Fraud**:
  - Store `gaze_violations_count` and `tab_violations_count` in the `interviews` table.
  - Display a transparent widget on screen for the candidate showing: "Violations: X/5".
  - If violations exceed 5, transition interview status to `SUSPENDED`. Immediately halt recording/streaming, score the interview as 0, and flag the application as `FLAGGED_FRAUD` for HR. Do NOT delete user's data; save the partial transcript.
  - Disable violation counts for `PRACTICE` mode.
- **3D Avatar Mirror Mode**:
  - Map MediaPipe facial mesh tracking blendshapes in real-time to the Ready Player Me avatar (ARKit blendshapes compatibility). Optimize eye contact & stress metrics using throttled sampling (every 1-2 seconds) rather than running intensive analysis per-frame.
- **Two-Layer CV ATS Evaluation**:
  - *Layer 1 (Local Regex Matcher)*: Compare skills dynamically in the browser or via a lightweight API route against `job_skills` for immediate UI response.
  - *Layer 2 (Gemini AI Review)*: Executed only on click "Chấm điểm chi tiết bằng AI". Rate-limit this call based on the user's tier (`packages` & `transactions`).
- **AI Interview Persona Customization**:
  - Allow users/HR to select interviewer personalities: Friendly Mentor (soft voice, encourages), Stress Interviewer (vocal pressure, follow-up questions, cold looks), or Technical Specialist.
- **RPG Skill Tree Visualizer**:
  - Render a visual tree representation of candidate skills. Unlock skills with colors (green) and leave weak skills locked (gray) with recommendations/courses to unlock.
- **HR Highlights Summarizer & Audio Player**:
  - Generate a 1-minute highlight summary of candidate interviews for HR with direct click-to-play links for specific audio snippets.
- **Community Loop Integration**:
  - High-score mock interview transcripts (retained safely with redacted PII) should prompt candidate to "Publish to Community" which auto-creates a blog post draft (`blogs.status = 'DRAFT'`).
- **Static Table Deletion**:
  - The `question_bank` table has been deleted. AI must generate interview questions dynamically based on CV + JD.
- **Redis Caching Fallback**:
  - Implement safe try/catch blocks for Redis cache reads. If the Redis server is offline, fallback gracefully to querying PostgreSQL.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-06-28
