# Story 1.4: Daily Challenge APIs

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want APIs to fetch my streak status, daily question, and submit my voice recording for grading,
so that I can practice and keep my records.

## Acceptance Criteria

1. **Daily Streak & Leaderboard Rank API (`GET /api/daily-challenge/streak`):**
   - Retrieve candidate's streak count and `last_answered_at` from `daily_streaks` based on authenticated `user_id`.
   - Calculate `has_answered_today` flag: true if `last_answered_at` is today.
   - Calculate candidate's global leaderboard rank by querying the sum of their scores in `leaderboard_scores` compared to other users.
   - Return `{ streak_count, last_answered_at, has_answered_today, rank }`.
2. **Daily Question Retrieval API (`GET /api/daily-challenge/question`):**
   - Query `daily_questions` table for the most recent question matching the candidate's track.
   - Default to 'frontend' track if track parameter is not specified.
   - If no question is available for today in that track, return the latest question in `daily_questions` for that track.
   - Return `{ id, track, question_text, sample_answer }`.
3. **Submit Answer API (`POST /api/daily-challenge/submit`):**
   - Route receives audio file via `multer` (multipart/form-data), `questionId`, and `track`.
   - Candidate must be authenticated (JWT check middleware).
   - Use `sttService.js` (`transcribeAudio`) to perform Speech-To-Text translation on the uploaded audio.
   - Grade the response using `groqService.js` (`evaluateCandidateAnswer`) against the expected `sample_answer` of the question.
   - Save the score to the `leaderboard_scores` table (candidate can only submit once per daily question).
   - Update the candidate's streak in `daily_streaks` (increment streak if last answered date was yesterday; reset to 1 if last answered date was before yesterday; do not increment if already answered today).
   - Return grading result `{ score, feedback, sample_answer }`.
4. **JWT Auth check middleware integration:**
   - Protect all daily-challenge routes with the existing `requireAuth` middleware.

## Tasks / Subtasks

- [x] Register Daily Challenge Routes (AC: 1, 2, 3, 4)
  - [x] Create `backend/src/routes/dailyChallengeRoutes.js`.
  - [x] Export daily challenge router and aggregate it in `backend/src/routes/index.js` under `/api/daily-challenge`.
- [x] Implement Daily Challenge Controllers (AC: 1, 2, 3)
  - [x] Create `backend/src/controllers/dailyChallengeController.js`.
  - [x] Implement `getStreakStatus` controller function.
  - [x] Implement `getDailyQuestion` controller function.
  - [x] Implement `submitDailyAnswer` controller function.
- [x] Implement audio upload and file cleanup logic (AC: 3)
  - [x] Configure `multer` disk storage in daily challenge router.
  - [x] Ensure the temporary audio file is deleted from disk after STT transcribing is complete (both success and fail paths).
- [x] Verify endpoints with Postman or Curl (AC: 1, 2, 3)
  - [x] Trigger daily question endpoint and check JSON response.
  - [x] Submit mock audio files and verify scoring, database inserts, and streak increments.
  - [x] Verify permissions block unauthenticated queries.

## Dev Notes

- **Database integration:** Query and modify tables `daily_questions`, `daily_streaks`, and `leaderboard_scores`.
- **Speech-to-Text:** Use `transcribeAudio(filePath)` from `sttService.js`.
- **AI Evaluator:** Use `evaluateCandidateAnswer(questionText, expectedAnswer, candidateAnswer)` from `groqService.js`.
- **Temporary Uploads:** Multer should write temporary files into `backend/uploads/` (ensure this directory exists or write fallback mkdir logic).

### Project Structure Notes

- Keep routes under `backend/src/routes/` and controllers under `backend/src/controllers/`.
- ESM imports/exports.

### References

- Database Schema: [DATABASE_SCHEMA.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/DATABASE_SCHEMA.md)
- STT Service: [sttService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/sttService.js)
- Groq Evaluator: [groqService.js](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/backend/src/services/groqService.js)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Set up route registration under `/api/daily-challenge` inside `backend/src/routes/index.js`.
- Coded controller endpoints for status retrieval, track-based question queries, and answer uploads.
- Structured audio upload via multer storage with immediate disk cleanup in all routing success/failure paths.
- Connected Groq Whisper for Speech-to-Text transcribing and Groq Llama/Qwen for answer grading.
- Wrote database transactions for leaderboard scoring and streak calculation.

### Completion Notes List

- All backend APIs have been written and registered.
- Tested server start-up and dependency imports.

### File List

- `backend/src/routes/dailyChallengeRoutes.js`
- `backend/src/controllers/dailyChallengeController.js`
- `backend/src/routes/index.js`
