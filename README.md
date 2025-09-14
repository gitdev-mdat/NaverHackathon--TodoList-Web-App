[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)
# To-Do App – Preliminary Assignment Submission
⚠️ Please complete **all sections marked with the ✍️ icon** — these are required for your submission.

👀 Please Check ASSIGNMENT.md file in this repository for assignment requirements.

## 🚀 Project Setup & Usage
**How to install and run my project:**  

# Clone repo
git clone <repo-url>
cd <repo-folder>

# Install
npm install

# Dev
npm run dev 

## 🔗 Deployed Web URL or APK file
✍️ [Paste your link here]


## 🎥 Demo Video
**Demo video link (≤ 2 minutes):**  
📌 **Video Upload Guideline:** when uploading your demo video to YouTube, please set the visibility to **Unlisted**.  
- “Unlisted” videos can only be viewed by users who have the link.  
- The video will not appear in search results or on your channel.  
- Share the link in your README so mentors can access it.  

✍️ [Paste your video link here]


## 💻 Project Introduction

### a. Overview

TodoNaver is a minimal task-management web app that lets you create, edit, and delete tasks. It includes a month-view calendar with dot indicators, modals for viewing and editing tasks, a dashboard with statistics and a heatmap of activity, and an AI-powered “Natural Language → Task” feature (using Gemini) that parses instructions to automatically create tasks.

### b. Key Features & Function Manual

- Create / Edit / Delete tasks: title, description, priority (low / medium / high), start (datetime or all-day), optional end, all-day toggle.

- Complete tasks: toggle completed; completed tasks are hidden when filtered out.

- Calendar: month-grid view with dots on days that have tasks; click a day to open a modal listing that day’s tasks (view/edit).

- Dashboard: overview stats (completed, pending, “perfect days”), plus an activity heatmap.

- Recent activity: history of task creation and completion.

- AI Assistant (CreateFromNL): paste your Gemini API key into the client (session-only), enter an NL instruction (e.g. "Create deadline: submit Naver Hackathon slides next Friday 5pm, high priority"), Parse → preview parsed tasks → quick edits → Create → saved.

### c. Unique Features (What’s special about this app?) 

- Natural Language → Task: Integrated Gemini (client-side demo) to parse natural language into task JSON. Includes normalizeParsedTask to validate results and suggest defaults/warnings before creation.

- FE-first / No-BE: All logic runs client-side with localStorage persistence — built to meet the frontend-only hackathon requirement.


### d. Technology Stack and Implementation Methods

- Framework / Language: React + TypeScript

- Routing: react-router-dom

- Styling: CSS Modules

- Icons: lucide-react

- State & Storage: custom useTasks hook + localStorage as persistence

- AI: Gemini API (Generative Language API) via client helper lib/genaiClient.ts

- Parsing/Normalization: lib/normalizeParsedTask.ts — convert parsed model JSON → normalized Task object (ISO dates, all-day endExclusive, warnings)

- Build / Dev: Vite  — commands: npm run dev, npm run build

### e. Service Architecture & Database structure (when used)

** Current (hackathon): Frontend-only app

- Persistence: localStorage (key tasks_v1)

- No backend in this submission.

 ** If adding backend:

- Service: Node.js/Express or serverless function as proxy to Gemini (hide API key), store tasks in DB.

- DB Schema

## 🧠 Reflection

### a. If you had more time, what would you expand?

- Push notifications, reminder scheduling, calendar (Google Calendar) sync.

- More robust unit/integration tests, storybook for components, e2e tests.

- Better heatmap visuals (SVG or canvas) + accessibility improvements.


### b. If you integrate AI APIs more for your app, what would you do?

- Server-side parsing service: call Gemini from server to hide key, use response schema enforcement (responseJsonSchema) to make parse stricter.

- Features to add: automatic priority suggestion, task summarization, auto-tagging, meeting-notes → bulk tasks, smart due-date suggestions from text context, natural-language search.

- Safety & UX: show raw model output & warnings, let user confirm before create (avoid hallucinations). Use rate/usage monitoring and quota guard.


## ✅ Checklist
- [ ] Code runs without errors  
- [ ] All required features implemented (add/edit/delete/complete tasks)  
- [ ] All ✍️ sections are filled  
