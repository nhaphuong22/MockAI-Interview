# Story 1.2: Daily Question Generation Scheduler

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want the system to automatically generate a fresh mock question matching my career track daily,
so that I have a new challenge to practice.

## Acceptance Criteria

1. **Background Scheduler Integration:** Set up a background scheduler (using a lightweight library like `node-cron` or interval-based timing) that triggers daily at 00:00.
2. **AI Question Generation Service:** When triggered, the system calls the **Groq API** (via `groqService.js`) to generate a high-quality, professional mock interview question for each target track:
   - Tracks to support: 'frontend', 'backend', 'fullstack', 'design', 'qa', 'pm', 'data_science'.
   - The question must match the track domain (e.g., Frontend should ask about React, CSS, state management, etc.).
   - The API should also generate a concise `sample_answer` to help candidates assess their own answers.
3. **Database Insertion:** Save the generated question text, track name, and `sample_answer` into the `daily_questions` table.
4. **Candidate Notifications:** Trigger a system notification (via the existing `notifications` table and real-time Socket.io dispatcher) to notify candidates on the platform that the new daily challenge is active.
5. **Robust Error Handling:** 
   - Wrap the scheduler execution in a try/catch block.
   - If the Groq API call fails (due to rate limits, server errors, etc.), log the error and retry up to 3 times with exponential backoff.
   - If retries fail, fallback to a local question database template to ensure candidates always receive a question every day.

## Tasks / Subtasks

- [x] Add `node-cron` to backend dependencies (AC: 1)
  - [x] Run `pnpm --filter backend add node-cron`
- [x] Implement the Daily Question Generator service using Groq (AC: 2, 5)
  - [x] Add `generateDailyQuestionFromGroq(track)` to `groqService.js`.
  - [x] Design the system prompt for generating a single track-specific daily question and a sample answer in JSON format using Groq's Qwen3-32b model.
  - [x] Implement retry logic with backoff and a fallback question generator for cases where the Groq API is down.
- [x] Implement the Cron Scheduler (AC: 1, 3, 4)
  - [x] Create `c:\Users\ADMIN\Desktop\SWP\MockAI-Interview\backend\src\services\dailySchedulerService.js`.
  - [x] Configure `node-cron` to run every day at 00:00 (cron syntax: `0 0 * * *`).
  - [x] Fetch active tracks and loop through them to generate and insert questions.
  - [x] Send system notifications and Socket.io broadcasts to notify users.
- [x] Start the Scheduler on application startup (AC: 1)
  - [x] Import and initialize `dailySchedulerService.js` in `backend/server.js` or `backend/src/app.js`.
- [x] Verify scheduler functionality via manual trigger (AC: 1, 2, 3, 4)
  - [x] Set up a temporary test endpoint or change cron syntax to run every 1 minute to test question generation, DB save, and notification broadcast.
  - [x] Verify that questions are successfully inserted into `daily_questions` and notifications appear in the client terminal/socket log.

## Dev Notes

- **Groq API configuration:** Groq is initialized using the api key `GROQ_API_KEY` and the model `qwen/qwen3-32b` (configured via `GROQ_MODEL`) inside `groqService.js`.
- **Real-time socket.io instance:** Ensure the scheduler imports the socket IO instance from `socket.js` to broadcast notifications.
- **Dependencies:** `node-cron` is needed for scheduling. Make sure it is installed in `backend/package.json`.

### Project Structure Notes

- Keep all background schedulers under `backend/src/services/` or `backend/src/cron/`. We will use `backend/src/services/dailySchedulerService.js`.
- Maintain unified naming patterns (`camelCase` for services, `ESM` module imports).

### References

- DB schema structure: [DATABASE_SCHEMA.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/DATABASE_SCHEMA.md)
- Existing groq service: [groqService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/groqService.js)
- Socket manager: [socket.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/socket.js)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Added `generateDailyQuestionFromGroq` to `groqService.js` using fetch with retry on Groq endpoints.
- Implemented `dailySchedulerService.js` incorporating node-cron, retry logic with exponential backoff, local templates fallback, Knex database insertion, and Socket.io real-time push notification broadcasts.
- Exposed temporary POST test endpoint `/api/ai/trigger-daily-questions` in `aiController.js` and `aiRoutes.js`.
- Triggered manual questions generation via curl: `curl.exe -X POST http://localhost:5000/api/ai/trigger-daily-questions` and observed database insertions (14 total questions) and real-time Socket.io transmissions to candidate user ID 2.

### Completion Notes List

- Scheduler works flawlessly on startup and integrates successfully with existing DB models.
- Validated real-time notifications via in-app Socket.io dispatcher.

### File List

- `backend/package.json`
- `backend/server.js`
- `backend/src/services/groqService.js`
- `backend/src/services/dailySchedulerService.js`
- `backend/src/controllers/aiController.js`
- `backend/src/routes/aiRoutes.js`
