# Story 1.5: Dynamic Global Leaderboard

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to view a dynamic global leaderboard,
so that I can compare my progress with other candidates and stay motivated.

## Acceptance Criteria

1. **Leaderboard API (`GET /api/daily-challenge/leaderboard`):**
   - Query total scores aggregated from `leaderboard_scores` table grouped by `user_id`.
   - Join `users` to fetch candidate's `full_name` and `avatar_url`.
   - Join `daily_streaks` to fetch their current `streak_count`.
   - Order candidates descending by total score, then by streak count.
   - Return an array of ranked users `{ rank, userId, name, avatar, totalScore, streak }`.
   - Protect with `requireAuth` middleware.
2. **Leaderboard UI Component (`Leaderboard.jsx`):**
   - Create a premium Leaderboard tab/page at the candidate dashboard.
   - Display a list/table of top candidates with their rank, name, avatar, current streak (with a flame 🔥 icon), and total challenge points.
   - Highlight the current logged-in candidate's row with an active Ocean Blue border/background if they are in the leaderboard.
   - Top 3 candidates should have premium badges (e.g. gold/silver/bronze icons or custom glowing circles).
   - Use `framer-motion` for stagger animations when listing rows.
3. **Tab Integration:**
   - Add a third tab "Bảng Xếp Hạng" to the candidate dashboard switch control in `InterviewSelection.jsx` (alongside "Luyện Tập Mới" and "Lịch Sử Phỏng Vấn").
4. **Ocean Blue styling compliance:**
   - Ensure the card layout uses glassmorphism cards and Ocean Blue (`#0ea5e9` to `#38bdf8`) highlights.

## Tasks / Subtasks

- [x] Implement Leaderboard Backend Endpoint (AC: 1)
  - [x] Add `GET /leaderboard` route in `backend/src/routes/dailyChallengeRoutes.js`.
  - [x] Implement `getLeaderboard` function in `backend/src/controllers/dailyChallengeController.js`.
  - [x] Perform a Knex query joining `leaderboard_scores`, `users`, and `daily_streaks`.
- [x] Create Leaderboard Frontend Component (AC: 2, 4)
  - [x] Create `frontend/src/components/interview/Leaderboard.jsx` component.
  - [x] Integrate React Query to fetch data from `/api/daily-challenge/leaderboard`.
  - [x] Add Framer Motion stagger animations for table rows.
  - [x] Render ranks, avatars, names, streaks, and scores.
- [x] Integrate Leaderboard Tab into Dashboard (AC: 3)
  - [x] Update `InterviewSelection.jsx` to support the "leaderboard" tab.
  - [x] Render `Leaderboard.jsx` component inside the active tab.
- [x] Verify functionality and linting (AC: 4)
  - [x] Verify leaderboard displays correct ranks and highlights current user.
  - [x] Run `pnpm -C frontend run lint` and verify no compiler errors.

## Dev Notes

- **Query optimization:** Use appropriate indices on `leaderboard_scores(user_id, score)` and group by fields.
- **Micro-animations:** Stagger animations using Framer Motion `variants` to animate table rows one after the other.

### Project Structure Notes

- Keep the new UI file under `frontend/src/components/interview/Leaderboard.jsx`.
- Update daily challenge routes and controllers.

### References

- Database Schema: [DATABASE_SCHEMA.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/DATABASE_SCHEMA.md)
- Dashboard Layout: [frontend/src/components/interview/InterviewSelection.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/components/interview/InterviewSelection.jsx)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Coded backend SQL summation queries for user leaderboard scores joined with active streak counts.
- Created `Leaderboard.jsx` with Framer Motion stagger transition, real-time query filter, gold/silver/bronze badges, and active user highlighting.
- Embedded tab control trigger and rendered Leaderboard view inside candidate dashboard.
- Verified frontend code compiles with 0 ESLint errors.

### Completion Notes List

- Dynamic global leaderboard integrated and fully functional.

### File List

- `backend/src/routes/dailyChallengeRoutes.js`
- `backend/src/controllers/dailyChallengeController.js`
- `frontend/src/api/dailyChallengeApi.js`
- `frontend/src/components/interview/Leaderboard.jsx`
- `frontend/src/components/interview/InterviewSelection.jsx`
