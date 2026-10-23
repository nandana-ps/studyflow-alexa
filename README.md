# StudyFlow

StudyFlow is a student productivity web app and an **Alexa+-inspired simulated experience** for the Amazon Developer Hackathon. The animated orb and conversational UI are a browser-based design exercise: this is **not** an Alexa skill, does not connect to an Alexa device, and does not use Amazon private services. Its assistant uses transparent, local intent handling; no AI API, key, backend, or paid service is required.

## Run locally

**Requirements:** Node.js 18 or newer and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. Create and preview a production build with:

```powershell
npm run build
npm run preview
```

## Features

- A responsive dark dashboard with purple and cyan accents, animated assistant orb, task list, progress statistics, schedule, and 25-minute focus timer.
- Conversational task actions: add tasks (including priority, subject, and due date), rename, complete, and delete tasks. The assistant asks follow-up questions when a task name or exam subject is missing.
- A daily study schedule based on pending task priorities and deadlines, plus a practical exam revision checklist added to the task list.
- Context-aware progress summaries for completed, pending, overdue, and due-today tasks.
- Browser microphone input when the Web Speech API is available, with a text input fallback. Microphone permission is requested by the browser when voice input is started.
- Optional browser text-to-speech for assistant replies, with a per-message speak button.
- Task and recent conversation persistence through `localStorage`; first-launch sample tasks, search and priority filters, task editor, empty states, and storage error feedback.

## Supported browser features and limitations

Speech recognition uses the browser's Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`), which is not available in every browser and may require a secure context and microphone permission. When unavailable or denied, use the text box. Recognition is provided by the browser and may rely on the browser vendor's speech service; StudyFlow itself does not send speech to an AI assistant.

Spoken responses use the browser's `speechSynthesis` API. Availability and voice quality depend on the browser and installed system voices. Spoken replies are optional and can be enabled or disabled in the assistant panel.

The local assistant understands a limited set of intents and phrasings rather than arbitrary conversation. Task data and chat history stay in the current browser profile and are lost if its site storage is cleared. There is no account sync, remote backup, Alexa device integration, real Alexa service, or generative AI.

## Architecture

- **React 18** renders the existing dashboard, conversational assistant, task editor, schedule, and focus timer.
- **Vite** is retained for the development server and production bundler.
- **JavaScript and CSS** provide task state, local intent routing, browser speech APIs, and responsive presentation. No additional runtime packages are required.
- **`localStorage`** persists tasks and recent chat. Task actions from the assistant update the same React task state as the dashboard controls.
- **`src/App.jsx`** contains the application state and assistant behavior; **`src/styles.css`** contains the visual system and responsive styling; **`src/main.jsx`** mounts React.

## Project scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the static production app into `dist/` |
| `npm run preview` | Preview the production build locally |

The existing MIT license is retained in `LICENSE`.
