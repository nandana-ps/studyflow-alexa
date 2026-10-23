# StudyFlow

StudyFlow is a polished, Alexa+-inspired student productivity dashboard built for the Amazon Developer Hackathon. It is a **browser-based simulation**, not an Alexa skill, an Amazon product, or a real Alexa integration. The local study buddy uses transparent, predefined intent handling; it does not call an AI service.

## Run locally

**Requirements:** Node.js 18 or newer and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). To create and preview a production build:

```powershell
npm run build
npm run preview
```

## Features

- A responsive dark dashboard with task counts, completion progress, due-today stats, and a daily schedule view.
- Create, edit, complete, filter, search, and delete tasks, including subject, priority, and due date.
- A local study buddy with working quick actions for day planning, exam revision checklists, and progress updates.
- A 25-minute focus timer with pause and reset controls.
- Sample tasks on first launch, a clear-all action, useful empty states, storage-error messaging, and lightweight notifications.
- Tasks and recent chat history persist in the browser using `localStorage`.

## Assistant behavior and limitations

The assistant recognizes a small set of local intents (planning, exam/revision preparation, progress, and help) and otherwise explains the supported actions. It is not generative AI and has no external API, backend, account sync, Alexa device connection, or cross-browser persistence. Exam preparation asks for a subject in a browser prompt and adds practical checklist tasks to the task list. Data stays in the current browser profile; clearing browser storage removes it. If browser storage is unavailable, the app reports the save error.

## Architecture

- **React 18** renders the dashboard, task editor, schedule, chat, and focus timer.
- **Vite** provides the development server and production bundler.
- **JavaScript and CSS** implement app state, responsive styling, and the local intent router; there is no component library or runtime API dependency.
- **`localStorage`** persists task and chat state. First-run sample tasks are generated only when no task data has been saved.
- **`src/App.jsx`** contains the app and its local interactions; **`src/styles.css`** contains the responsive visual system; **`src/main.jsx`** mounts the app.

## Project scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the static production app into `dist/` |
| `npm run preview` | Preview the production build locally |

The existing MIT license is retained in `LICENSE`.
