# Story 1.3: Daily Flash Interview User Interface

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want a dashboard widget showing my daily challenge status and a voice recorder interface,
so that I can practice answering within 60 seconds.

## Acceptance Criteria

1. **Dashboard Streak Widget:**
   - Design a premium, gamified card on the Candidate Dashboard.
   - Show the candidate's current streak (with a dynamic fire icon 🔥, active/inactive states based on streak value).
   - Display a clear status: "Thử thách hôm nay đã sẵn sàng!" or "Bạn đã hoàn thành thử thách hôm nay!".
   - A button "Luyện tập ngay" that launches the challenge interface.
2. **Interactive Challenge Interface (Modal/Overlay):**
   - Display the daily question text matching the candidate's current track.
   - Show a 60-second visual countdown timer (circular or horizontal bar that shrinks and changes color from Ocean Blue to Warning Red in the final 10 seconds).
   - Micro-animations: Add entrance animations (using Framer Motion) for elements, and pulsing waves around the active recording button.
3. **Voice Recording & Audio Player:**
   - Integrate Web MediaRecorder API to record candidate audio from the microphone.
   - Show a live waveform visualizer (canvas-based or CSS animation) while recording.
   - Auto-stop recording precisely when the 60-second timer hits 0.
   - Let candidates review (play back) their recorded answer before submitting.
4. **AI Processing / Loading State:**
   - Display a premium "AI grading" spinner or rotating glassmorphism sphere.
   - Show progress status text (e.g., "AI đang phân tích câu trả lời...", "Đang chấm điểm từ vựng...") to engage the candidate.
5. **Ocean Blue Styling & Design Tokens:**
   - Strictly use the Ocean Blue primary palette (`#0ea5e9`, `#38bdf8`).
   - Use glassmorphic card designs (blur background, semi-transparent borders).
   - No purple/violet color profiles permitted.

## Tasks / Subtasks

- [x] Create a reusable Daily Challenge Streak Widget (AC: 1)
  - [x] Implement `DailyStreakWidget.jsx` component.
  - [x] Add Tailwind CSS v4 styling with Ocean Blue primary colors.
  - [x] Render streak count, fire icon 🔥, and challenge status.
- [x] Implement the Audio Recorder Hook (AC: 3)
  - [x] Create `useAudioRecorder.js` hook utilizing browser `MediaRecorder` API.
  - [x] Support start, stop, pause, and preview functionality.
  - [x] Handle permission error states gracefully.
- [x] Create the Daily Challenge Modal (AC: 2, 3, 4)
  - [x] Implement `DailyChallengeModal.jsx` using `@radix-ui/react-dialog` or standard custom React modal.
  - [x] Integrate the countdown timer with a 60-second limit and visual warnings.
  - [x] Build the audio waveform visualizer component.
  - [x] Add the preview player and submit controls.
- [x] Integrate Widget and Modal into Candidate Dashboard (AC: 1, 2)
  - [x] Place the widget on the Candidate Dashboard page.
  - [x] Wire up the modal trigger button.
  - [x] Stub API submission calls and show a premium Framer Motion loading spinner while simulating the AI evaluation phase.
- [x] Verify UI flow and responsiveness (AC: 5)
  - [x] Test recording workflow in Chrome/Firefox.
  - [x] Verify that UI scales correctly on mobile, tablet, and desktop screens.
  - [x] Verify color palette complies with Ocean Blue theme constraints.

## Dev Notes

- **Zustand vs TanStack Query:** Current daily challenge status, streaks, and question should be fetched from the backend using TanStack Query. Local UI state (modal open, countdown active, recording active) should use local state/Zustand if shared.
- **Waveform Visualization:** A simple HTML Canvas visualizer utilizing `AudioContext` and `AnalyserNode` provides the best visual feedback.
- **Micro-animations:** Utilize `framer-motion` for page transitions and modal slide-ins.

### Project Structure Notes

- Keep all new UI components under `frontend/src/components/` or `frontend/src/pages/`.
- Ensure files follow PascalCase naming conventions.

### References

- Project design guidelines: [_bmad-output/project-context.md](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/_bmad-output/project-context.md)
- App layout: [frontend/src/routes/index.jsx](file:///c:/Users/ADMIN/Desktop/SWP/MockAI-Interview/frontend/src/routes/index.jsx)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash

### Debug Log References

- Created `useAudioRecorder.js` hook to handle browser recording and state cleanup.
- Created `DailyStreakWidget.jsx` for dashboard visualization, and `DailyChallengeModal.jsx` for overlay interactive question prompt.
- Integrated Canvas visualizer for active voice feedback and 60-second visual countdown.
- Placed widget and wired up triggers in `InterviewSelection.jsx`.
- Verified frontend code builds and passes ESLint lint checks cleanly.

### Completion Notes List

- All widgets, modal, timers, recording triggers, and visualizers are operational.
- Responsive design styling completed under Ocean Blue design guidelines.

### File List

- `frontend/src/api/dailyChallengeApi.js`
- `frontend/src/hooks/useAudioRecorder.js`
- `frontend/src/components/interview/DailyStreakWidget.jsx`
- `frontend/src/components/interview/DailyChallengeModal.jsx`
- `frontend/src/components/interview/InterviewSelection.jsx`
