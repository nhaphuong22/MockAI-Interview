---
stepsCompleted: ['requirements_extraction', 'epic_design', 'story_generation', 'final_validation']
inputDocuments: ['Task.md', 'DATABASE_SCHEMA.md', 'project-context.md']
status: 'complete'
optimized_for_llm: true
---

# MockAI-Interview - Epic Breakdown (New Features)

## Overview

This document provides the complete epic and story breakdown for the three new premium features of MockAI-Interview:
1. **Daily Flash Interview** (Thử thách phỏng vấn nhanh hàng ngày)
2. **RPG Skill Tree & Knowledge Graph** (Sơ đồ cây kỹ năng tương tác RPG)
3. **Candidate Interview Highlights for HR** (Công cụ tóm tắt khoảnh khắc nổi bật của ứng viên cho HR)

This breakdown translates requirements and architectural decisions into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR1 (Daily Flash Question Generation):** Every day, the system automatically triggers an AI-generated question matching the user's career interest (e.g. Frontend, Backend). It pushes a notification to the user.
- **FR2 (Daily Flash Recording & AI Evaluation):** Candidates have a 60-second limit to record their answer. The backend uses the Cloud Whisper API to transcribe and Gemini to score the answer instantly.
- **FR3 (Daily Streak & Rewards):** The system tracks candidate's daily streak (`streak_count`). Reaching milestones rewards the candidate (e.g. unlocks premium mock sessions, virtual badges).
- **FR4 (Global Leaderboard):** Displays daily scores on a global community leaderboard, updating dynamically.
- **FR5 (AI Skill Mapping):** AI parses candidate CV and interview assessments to extract a structured skill map (JSON containing nodes, links, and status: locked/unlocked).
- **FR6 (Interactive Skill Tree Navigation):** Users can click on nodes in the skill tree to see AI feedback (strengths/weaknesses), practice questions, and recommended courses/resources.
- **FR7 (Interview Highlight Extraction):** Backend AI analyzes complete interview sessions (audio and transcripts) to extract key highlights (e.g., strong answers, hesitant moments, violations) and generates a 1-minute read text summary.
- **FR8 (Click-to-play Audio Highlights):** On the HR dashboard, display candidate summaries with timestamps. Clicking a play button plays the specific 30-second audio snippet from that timestamp.

### NonFunctional Requirements

- **NFR1 (Real-time Leaderboard Latency):** Leaderboard updates must use Redis cache and Socket.io to prevent database overload during high-traffic hours.
- **NFR2 (Audio Processing Speed):** Daily flash answer analysis and grading must complete under 3 seconds to keep candidate engagement high.
- **NFR3 (Responsive Graph Visuals):** The RPG Skill tree graph must render fluidly on mobile and desktop without visual layout shifts or browser stuttering.

### Additional Requirements

- **Database Schema Updates:** Create migrations to add fields for daily streaks, leaderboard logs, skill tree data cache, and interview highlights.
- **Background Cron Job:** Integrate a scheduler to generate questions and check streaks daily.
- **Audio Clipping Service:** Implement backend logic to clip specific 30-second audio files based on AI-identified highlight timestamps.

### UX Design Requirements

- **UX-DR1 (Duolingo-style Streak Widget):** A flame-shaped streak icon in the Navbar showing the user's active streak count.
- **UX-DR2 (60s Flash Interview UI):** Simple fullscreen overlay with 60-second countdown timer, animated wave representation of microphone audio input, and instant score reveal.
- **UX-DR3 (Interactive RPG Skill Tree Graph):** Visual node tree using custom color tokens (Ocean Blue gradient for unlocked nodes, grayscale for locked nodes).
- **UX-DR4 (HR Highlight Cards):** Clean summary cards on the HR dashboard with highlighted key moments and embedded audio play buttons.

### FR Coverage Map

- **FR1 (Daily Flash Question Generation):** Epic 1 - Generates and notifies daily questions.
- **FR2 (Daily Flash Recording & AI Evaluation):** Epic 1 - Handles 60s audio recording and STT/AI scoring.
- **FR3 (Daily Streak & Rewards):** Epic 1 - Tracks streak metrics and rewards milestones.
- **FR4 (Global Leaderboard):** Epic 1 - Dynamic leaderboard rendering with Redis/Sockets.
- **FR5 (AI Skill Mapping):** Epic 2 - AI parses assessment scores to JSON skill map.
- **FR6 (Interactive Skill Tree Navigation):** Epic 2 - Renders nodes tree and handles navigation/courses.
- **FR7 (Interview Highlight Extraction):** Epic 3 - AI extracts highlights, flags, and text summaries.
- **FR8 (Click-to-play Audio Highlights):** Epic 3 - Dynamic clipping and playback on HR dashboard.

## Epic List

### Epic 1: Daily Flash Interview Challenge (Thử thách phỏng vấn nhanh hàng ngày)
- **Goal Statement**: Enable candidates to practice speaking skills daily through a quick 60-second interview, build a streak habits (Duolingo style), and check their global rank on a dynamically updated leaderboard.
- **FRs Covered**: FR1, FR2, FR3, FR4
- **UX/NFRs Covered**: NFR2, UX-DR1, UX-DR2

### Epic 2: Interactive RPG Skill Tree & Knowledge Graph (Sơ đồ cây kỹ năng tương tác RPG)
- **Goal Statement**: Allow candidates to visualize their strengths and weaknesses from CV/interviews on an interactive 3D/SVG node tree, click nodes for detailed AI reviews, and access targeted questions and resources to improve.
- **FRs Covered**: FR5, FR6
- **UX/NFRs Covered**: NFR3, UX-DR3

### Epic 3: Recruiter Candidate Highlights & Clipped Audio Player (Tóm tắt khoảnh khắc nổi bật của ứng viên cho HR)
- **Goal Statement**: Enable recruiters (HR) to quickly screen applicants by reading 1-minute AI-generated highlight summaries of their interviews and listening to specific 30-second audio snippets, dramatically reducing candidate evaluation time.
- **FRs Covered**: FR7, FR8
- **UX/NFRs Covered**: NFR1, UX-DR4

## Epic 1: Daily Flash Interview Challenge

### Goal
Enable candidates to practice speaking skills daily through a quick 60-second interview, build a streak habits (Duolingo style), and check their global rank on a dynamically updated leaderboard.

### Story 1.1: Database Migrations for Streaks and Leaderboard
As a developer,
I want to create database schemas for daily questions, streaks, and leaderboard scores,
So that I can store daily challenge data.

**Acceptance Criteria:**
- **Given** no daily challenge tables exist.
- **When** I run the Knex migrations.
- **Then** the tables `daily_questions`, `daily_streaks`, and `leaderboard_scores` are created.
- **And** foreign keys are correctly linked to the `users` table.

### Story 1.2: Daily Question Generation Scheduler
As a candidate,
I want the system to automatically generate a fresh mock question matching my career track daily,
So that I have a new challenge to practice.

**Acceptance Criteria:**
- **Given** a background cron job scheduler is active.
- **When** it triggers daily at 00:00.
- **Then** the backend calls the Gemini API to generate professional questions per track and saves them to `daily_questions`.
- **And** pushes a notification to users in that track.

### Story 1.3: 60-Second Audio Recording and AI Evaluation
As a candidate,
I want to record my voice answer for the daily question with a 60-second limit,
So that I can practice speaking under time pressure and receive immediate AI scores.

**Acceptance Criteria:**
- **Given** a user is on the Daily Challenge page.
- **When** they click "Start" and speak.
- **Then** a fullscreen overlay with a 60-second countdown and audio wave animation is displayed.
- **And** upon completion or clicking stop, the audio chunk is uploaded to backend.
- **And** the backend calls Cloud Whisper API (STT) and Gemini (Grading) to return score and feedback under 3 seconds.

### Story 1.4: Daily Streak & Reward System
As a candidate,
I want the system to track my consecutive days of participation (streak) and award me milestones,
So that I am motivated to practice daily.

**Acceptance Criteria:**
- **Given** a candidate completes the daily challenge.
- **When** they submit their answer.
- **Then** the system increments their `streak_count` in `daily_streaks` if the last submission was within 36 hours.
- **And** if the streak reaches milestones (e.g., 7 days), it unlocks premium mock interview tokens or awards badges.

### Story 1.5: Dynamic Global Leaderboard
As a candidate,
I want to see a global leaderboard of daily scores,
So that I can compare my performance with other candidates.

**Acceptance Criteria:**
- **Given** a candidate's score is submitted.
- **When** their score is finalized.
- **Then** the daily leaderboard is updated.
- **And** the daily leaderboard is rendered on the frontend using Socket.io and cached in Redis.

## Epic 2: Interactive RPG Skill Tree & Knowledge Graph

### Goal
Allow candidates to visualize their strengths and weaknesses from CV/interviews on an interactive 3D/SVG node tree, click nodes for detailed AI reviews, and access targeted questions and resources to improve.

### Story 2.1: Database Schema and Mock/Seed Data
As a developer,
I want to create database schemas for caching candidates' skill tree states and seed mock JSON data,
So that I can develop and test the graph UI independently.

**Acceptance Criteria:**
- **Given** no skill tree caching schemas exist.
- **When** I run the Knex migrations.
- **Then** the table `user_skill_trees` is created with columns `user_id`, `graph_data` (JSONB), and `last_updated`.
- **And** Knex seeds populate mock JSON data containing at least 10 linked skills with varying scores and lock/unlock statuses.

### Story 2.2: Skill Tree Initialization from CV Upload
As a candidate,
I want my skill tree to initialize and light up matching skills immediately when I upload my CV for the first time,
So that I see my starting profile graph.

**Acceptance Criteria:**
- **Given** a candidate uploads their CV for the first time.
- **When** the AI finished parsing the CV and extracting skills.
- **Then** the backend automatically creates a default skill tree graph JSON matching the user's role.
- **And** unlocks (lights up green) the nodes representing skills found in the CV (ATS CV skills), saving it to `user_skill_trees`.

### Story 2.3: Interactive 3D/SVG Skill Graph Visualization
As a candidate,
I want to see my skill tree as an interactive visual graph with locked/unlocked nodes,
So that I can easily browse my skill development.

**Acceptance Criteria:**
- **Given** the candidate is on their Profile or Career page.
- **When** the page loads.
- **Then** the system renders a node tree graph using custom SVG or Canvas (Three.js/R3F).
- **And** unlocked nodes use the Ocean Blue gradient (`#0ea5e9` to `#38bdf8`) while locked nodes are displayed in Grayscale.
- **And** the graph is responsive and does not cause visual layout shifts or browser lag.

### Story 2.4: Node Interaction and Learning Recommendations Panel
As a candidate,
I want to click on a skill node to view detailed AI feedback, practice questions, and recommended courses,
So that I know how to improve that specific skill.

**Acceptance Criteria:**
- **Given** the candidate is viewing the skill tree.
- **When** they click on a specific skill node.
- **Then** a side panel slides open using Framer Motion.
- **And** displays: AI feedback summary, 3 targeted mock interview questions, and 2-3 links to recommended courses or documentation.
- **And** clicking a question redirects the user to start a practice interview for that skill.

### Story 2.5: Real-time Skill Tree Updates
As a candidate,
I want my skill tree scores and node lock/unlock status to update immediately after I complete an AI interview,
So that I see my progress.

**Acceptance Criteria:**
- **Given** a candidate completes an AI interview.
- **When** the AI assessment is saved to `assessments`.
- **Then** the backend triggers an update to the user's JSON graph in `user_skill_trees`, incrementing scores of tested skills.
- **And** unlocks adjacent nodes if the parent skill score exceeds 70/100.
- **And** the updated graph is pushed to the frontend via Socket.io.

## Epic 3: Recruiter Candidate Highlights & Clipped Audio Player

### Goal
Enable recruiters (HR) to quickly screen applicants by reading 1-minute AI-generated highlight summaries of their interviews and listening to specific 30-second audio snippets, dramatically reducing candidate evaluation time.

### Story 3.1: Database Schema and Mock Data for Highlights
As a developer,
I want to create database schemas for storing interview highlight summaries and seed mock data,
So that I can develop the HR Highlights dashboard independently.

**Acceptance Criteria:**
- **Given** no database fields or tables exist for highlights.
- **When** I run the Knex migrations.
- **Then** the table `interview_highlights` is created with columns `interview_id`, `highlight_summary` (text), `is_flagged` (boolean), and `timestamps_data` (JSONB).
- **And** Knex seeds populate mock highlight text and timestamps data to test the audio player frontend.

### Story 3.2: AI Highlight Extraction Service
As a recruiter,
I want the system to automatically generate a 1-minute summary and timestamps of key interview moments,
So that I don't have to read the whole transcript.

**Acceptance Criteria:**
- **Given** a candidate completes an interview (or an interview is suspended due to fraud).
- **When** the assessment is saved.
- **Then** the backend calls Gemini to analyze the candidate answers and transcripts, extracting key highlights, their corresponding timestamps, and a 1-minute summary.
- **And** saves this data to `interview_highlights`.

### Story 3.3: HR Candidate Highlights Dashboard
As a recruiter,
I want to view a concise card summary of candidate highlights on the applicant detail page,
So that I can screen them in 1 minute.

**Acceptance Criteria:**
- **Given** HR is viewing the applicant list or detail page.
- **When** they click on a candidate.
- **Then** a clean card displays the AI 1-minute highlights summary.
- **And** bullet points show key moments with clickable timestamps.
- **And** for suspended or flagged candidates, a red warning badge highlights the fraud reason.

### Story 3.4: Audio Slicing API and Embedded Playback
As a recruiter,
I want to click on a timestamp to play the specific 30-second audio clip of that answer directly on the dashboard,
So that I can verify the candidate's tone and communication.

**Acceptance Criteria:**
- **Given** HR is viewing the Highlights card.
- **When** they click the Play button next to a timestamp.
- **Then** the backend serves the specific question's audio clip mapped to that timestamp without loading the entire interview audio.
- **And** the frontend mini audio player starts playing the audio snippet smoothly.


