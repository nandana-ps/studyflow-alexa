import { useEffect, useMemo, useRef, useState } from "react";

const TASKS_KEY = "studyflow.tasks.v1";
const CHAT_KEY = "studyflow.chat.v1";

const dayOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const starterTasks = () => [
  { id: crypto.randomUUID(), title: "Review cellular respiration notes", subject: "Biology", priority: "High", dueDate: dayOffset(0), completed: false },
  { id: crypto.randomUUID(), title: "Finish problem set 04", subject: "Mathematics", priority: "High", dueDate: dayOffset(1), completed: false },
  { id: crypto.randomUUID(), title: "Read chapters 6–7", subject: "Psychology", priority: "Medium", dueDate: dayOffset(2), completed: false },
  { id: crypto.randomUUID(), title: "Draft history essay outline", subject: "History", priority: "Low", dueDate: dayOffset(4), completed: true },
];

const initialChat = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hey, Nandana! Your study space is ready. I can help you shape a plan, get ready for an exam, or make sense of what’s on your list.",
    time: new Date().toISOString(),
  },
];

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback() : JSON.parse(raw);
  } catch (error) {
    console.error(`Could not load ${key} from localStorage.`, error);
    return fallback();
  }
}

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3.5 6 .8.8L6 5M3.5 12l.8.8L6 11M3.5 18l.8.8L6 17" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v6M14 10v6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    edit: <><path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6" /></>,
    volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5ZM4 17a2.5 2.5 0 0 1 2.5-2.5H20" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function formattedDate(date) {
  if (!date) return "No deadline";
  const value = new Date(`${date}T12:00:00`);
  if (date === dayOffset(0)) return "Today";
  if (date === dayOffset(1)) return "Tomorrow";
  return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function TaskEditor({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || { title: "", subject: "", priority: "Medium", dueDate: dayOffset(1) });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim(), subject: form.subject.trim() || "General" });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="task-modal" onSubmit={submit}>
        <div className="modal-heading">
          <div><span className="eyebrow">{task ? "MAKE AN UPDATE" : "MAKE IT HAPPEN"}</span><h2>{task ? "Edit task" : "Add a task"}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <label>Task name<input autoFocus required maxLength="100" placeholder="What do you need to work on?" value={form.title} onChange={(e) => update("title", e.target.value)} /></label>
        <div className="form-row">
          <label>Subject<input maxLength="40" placeholder="e.g. Biology" value={form.subject} onChange={(e) => update("subject", e.target.value)} /></label>
          <label>Priority<select value={form.priority} onChange={(e) => update("priority", e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></label>
        </div>
        <label>Due date<input type="date" value={form.dueDate || ""} onChange={(e) => update("dueDate", e.target.value)} /></label>
        <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">{task ? "Save changes" : "Add task"} <Icon name="arrow" size={16} /></button></div>
      </form>
    </div>
  );
}

function AssistantStage({
  chat, message, setMessage, sendMessage, isListening, voiceError,
  speechSupported, startListening, speakReplies, setSpeakReplies, speakText,
}) {
  return (
    <section className="assistant-stage" aria-label="StudyFlow conversational assistant">
      <div className={`assistant-orb-wrap ${isListening ? "listening" : ""}`}>
        <span className="orb-ring orb-ring-one" /><span className="orb-ring orb-ring-two" />
        <button className="assistant-orb" onClick={startListening} aria-label={speechSupported ? (isListening ? "Listening for your request" : "Speak to your study buddy") : "Voice input unavailable; type your request instead"}>
          <span className="orb-glow" /><Icon name="spark" size={38} />
        </button>
        <span className="orb-status"><i />{isListening ? "LISTENING" : "READY WHEN YOU ARE"}</span>
        <span className="orb-caption">Your study buddy</span>
      </div>
      <div className="assistant-stage-content">
        <div className="assistant-stage-heading">
          <div><span className="eyebrow">A LITTLE HELP, RIGHT ON TIME</span><h2>What’s on your mind<span className="heading-period">?</span></h2><p>Ask naturally. I’ll help turn your next step into a plan.</p></div>
          <button className={`speech-toggle ${speakReplies ? "enabled" : ""}`} onClick={() => setSpeakReplies((enabled) => !enabled)} title="Toggle spoken assistant replies" aria-pressed={speakReplies}><Icon name="volume" size={15} /> <span>{speakReplies ? "Voice on" : "Voice off"}</span></button>
        </div>
        <div className="assistant-stage-feed" aria-live="polite">
          {chat.slice(-3).map((entry) => <div className={`stage-message ${entry.role === "user" ? "stage-user" : ""}`} key={entry.id}>
            {entry.role === "assistant" && <span className="stage-message-icon"><Icon name="spark" size={13} /></span>}
            <div className="stage-message-text">{entry.text.split("\n").map((line, index) => <span key={`${entry.id}-${index}`}>{line || "\u00a0"}</span>)}</div>
            {entry.role === "assistant" && <button className="speak-message" onClick={() => speakText(entry.text)} aria-label="Speak this response" title="Speak this response"><Icon name="volume" size={13} /></button>}
          </div>)}
        </div>
        <div className="assistant-suggestions">
          <button onClick={() => sendMessage("Plan my day")}><Icon name="calendar" size={14} /> Plan my day</button>
          <button onClick={() => sendMessage("Prepare for an exam")}><Icon name="book" size={14} /> Exam revision</button>
          <button onClick={() => sendMessage("How am I doing?")}><Icon name="spark" size={14} /> My progress</button>
        </div>
        {(voiceError || !speechSupported) && <p className="voice-note" role="status">{voiceError || "Voice input isn’t available in this browser. Type your request above instead."}</p>}
        <form className="stage-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
          <input aria-label="Message your study buddy" placeholder={isListening ? "Listening… or type here instead" : "Try “add a task: review Biology, high priority”"} value={message} onChange={(event) => setMessage(event.target.value)} />
          <button className={`mic-button ${isListening ? "mic-active" : ""}`} type="button" onClick={startListening} aria-label={speechSupported ? "Use voice input" : "Voice input not supported"} title={speechSupported ? "Use voice input" : "Voice input is not supported in this browser"} disabled={!speechSupported || isListening}><Icon name="mic" size={17} /></button>
          <button className="stage-send" type="submit" aria-label="Send message" disabled={!message.trim()}><Icon name="send" size={16} /></button>
        </form>
        <p className="stage-disclaimer"><Icon name="spark" size={12} /> Alexa+-inspired simulation · no Alexa device, Amazon service, or AI API connected</p>
      </div>
    </section>
  );
}

function App() {
  const [tasks, setTasks] = useState(() => loadStored(TASKS_KEY, starterTasks));
  const [chat, setChat] = useState(() => loadStored(CHAT_KEY, () => initialChat));
  const [activeView, setActiveView] = useState("Overview");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState(null);
  const [storageError, setStorageError] = useState("");
  const [toast, setToast] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [pendingAction, setPendingAction] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [speakReplies, setSpeakReplies] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); setStorageError(""); }
    catch (error) { console.error("Could not save tasks to localStorage.", error); setStorageError("Your tasks could not be saved. Check that your browser allows local storage."); }
  }, [tasks]);

  useEffect(() => {
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(chat)); setStorageError(""); }
    catch (error) { console.error("Could not save chat to localStorage.", error); setStorageError("Your chat could not be saved. Check that your browser allows local storage."); }
  }, [chat]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = window.setInterval(() => setSeconds((current) => {
      if (current <= 1) { setTimerRunning(false); setToast("Focus session complete — take a well-earned break."); return 25 * 60; }
      return current - 1;
    }), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => () => {
    recognitionRef.current?.abort();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedCount = tasks.length - pendingTasks.length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const todayTasks = pendingTasks.filter((task) => task.dueDate && task.dueDate <= dayOffset(0)).length;
  const visibleTasks = useMemo(() => tasks
    .filter((task) => activeView !== "My Tasks" || !task.completed)
    .filter((task) => filter === "All" || task.priority === filter)
    .filter((task) => `${task.title} ${task.subject}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [tasks, filter, search, activeView]);

  function addChat(role, text) {
    setChat((current) => [...current, { id: crypto.randomUUID(), role, text, time: new Date().toISOString() }].slice(-80));
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) {
      setVoiceError("Spoken replies aren’t supported here. You can still read and type messages.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[☐]/g, ""));
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  const speechSupported = typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  function startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError("Voice input isn’t supported by this browser. Type your request in the message box instead.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    setVoiceError("");
    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      setIsListening(false);
      if (transcript) sendMessage(transcript);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceError(event.error === "not-allowed"
        ? "Microphone access was blocked. Allow it in your browser settings, or type your request instead."
        : "I couldn’t hear that clearly. Try again or type your request.");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Could not start browser speech recognition.", error);
      setVoiceError("Voice input could not start. You can type your request instead.");
    }
  }

  function makePlan() {
    const ordered = [...pendingTasks].sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority]) || (a.dueDate || "").localeCompare(b.dueDate || ""));
    if (!ordered.length) return "You’re all caught up! Add a task whenever something new lands on your plate.";
    const blocks = ordered.slice(0, 6).map((task, index) => `${index + 1}. ${["9:00", "10:00", "11:30", "1:00", "2:30", "4:00"][index]} — ${task.title} (${task.subject}, 45 min)`).join("\n");
    return `Here’s a balanced plan for your ${ordered.length > 6 ? "top 6 of " : ""}${ordered.length} pending tasks. Start with the most urgent, and leave a little breathing room between blocks:\n\n${blocks}\n\nTake a 10-minute reset between sessions. You’ve got this.`;
  }

  function makeExamChecklist() {
    setPendingAction({ type: "exam" });
    return "Which subject is your exam for? Tell me the subject and I’ll make a practical revision checklist.";
  }

  function buildExamChecklist(subject) {
    const name = subject.trim() || "Exam";
    const checklist = [
      `Gather your ${name} notes and list the topics to review`,
      `Review the toughest ${name} concepts and make flashcards`,
      `Practice ${name} questions without looking at your notes`,
      `Check your answers and revisit anything that felt tricky`,
      `Do a quick final review and get a good night’s sleep`,
    ];
    const existing = new Set(tasks.map((task) => task.title.toLowerCase()));
    const additions = checklist.filter((title) => !existing.has(title.toLowerCase())).map((title, index) => ({
      id: crypto.randomUUID(), title, subject: name, priority: index < 2 ? "High" : "Medium", dueDate: dayOffset(index + 1), completed: false,
    }));
    if (additions.length) setTasks((current) => [...additions, ...current]);
    return `Your ${name} revision checklist is ready${additions.length < checklist.length ? " (I skipped items already on your list)" : ""}:\n\n${checklist.map((item) => `☐ ${item}`).join("\n")}\n\nI’ve added the new steps to My Tasks, spread across the next few days.`;
  }

  function answerFollowUp(text) {
    const pending = pendingAction;
    if (!pending) return null;
    if (pending.type === "exam") {
      setPendingAction(null);
      return buildExamChecklist(text.trim());
    }
    if (pending.type === "create-title") {
      const title = text.trim();
      if (!title) return "What should I call the task? You can say something like “review Biology notes.”";
      const task = { id: crypto.randomUUID(), title, subject: "General", priority: "Medium", dueDate: dayOffset(1), completed: false };
      setTasks((current) => [task, ...current]);
      setPendingAction(null);
      return `Added “${title}” to your tasks, due tomorrow. You can say “edit ${title}” if you’d like to add a subject or change the details.`;
    }
    const target = text.trim().toLowerCase();
    const matches = tasks.filter((task) => task.title.toLowerCase().includes(target) || target.includes(task.title.toLowerCase()));
    if (matches.length !== 1) return matches.length > 1 ? "I found a few matching tasks. Tell me a little more of the task name so I update the right one." : `I couldn’t find a task matching “${text}”. Try its task name, or say “cancel.”`;
    setPendingAction(null);
    return applyTaskAction(pending.type, matches[0], pending.newTitle);
  }

  function applyTaskAction(type, task, newTitle) {
    if (type === "complete") {
      if (task.completed) return `“${task.title}” is already marked complete.`;
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: true } : item));
      return `Nicely done — I marked “${task.title}” complete. You’ve finished ${completedCount + 1} of ${tasks.length} tasks.`;
    }
    if (type === "delete") {
      setTasks((current) => current.filter((item) => item.id !== task.id));
      return `Removed “${task.title}” from your tasks.`;
    }
    if (type === "edit") {
      if (!newTitle) {
        setPendingAction({ type: "edit-title", taskId: task.id });
        return `What would you like to rename “${task.title}” to?`;
      }
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, title: newTitle } : item));
      return `Updated the task name to “${newTitle}”.`;
    }
    return "I’m not sure which task action you meant. Try adding, editing, completing, or deleting a task.";
  }

  function sendMessage(text = message) {
    const trimmed = text.trim();
    if (!trimmed) return;
    addChat("user", trimmed);
    setMessage("");
    const normalized = trimmed.toLowerCase();
    let response;
    if (normalized === "cancel" || normalized === "never mind" || normalized === "nevermind") {
      setPendingAction(null);
      response = "No problem — I’ve cancelled that.";
    } else if (pendingAction?.type === "edit-title") {
      const taskId = pendingAction.taskId;
      const newTitle = trimmed;
      setTasks((current) => current.map((task) => task.id === taskId ? { ...task, title: newTitle } : task));
      setPendingAction(null);
      response = `Updated the task name to “${newTitle}”.`;
    } else if (pendingAction) {
      response = answerFollowUp(trimmed);
    } else if (normalized.includes("plan") || normalized.includes("schedule") || normalized.includes("my day")) response = makePlan();
    else if (normalized.includes("exam") || normalized.includes("revision") || normalized.includes("revise")) {
      const subjectMatch = trimmed.match(/\b(?:for|in|about)\s+(?:my\s+)?(?:an?\s+)?([a-z][a-z -]*?)\s+(?:exam|test|revision|review)\b/i);
      const subject = subjectMatch?.[1]?.trim().replace(/^(?:a|an|my)(?:\s+|$)/i, "").trim();
      response = subject ? buildExamChecklist(subject) : makeExamChecklist();
    }
    else if (/^(add|create|make)\b/.test(normalized)) {
      const detail = trimmed.replace(/^(?:please\s+)?(?:add|create|make)\s+(?:a\s+)?(?:new\s+)?(?:task\s*)?(?::|to)?\s*/i, "");
      if (!detail) {
        setPendingAction({ type: "create-title" });
        response = "What would you like to add to your tasks?";
      } else {
        const priority = /\bhigh\b/i.test(detail) ? "High" : /\blow\b/i.test(detail) ? "Low" : "Medium";
        const dateMatch = detail.match(/\b(today|tomorrow|next week)\b/i);
        const dueDate = dateMatch ? dayOffset(dateMatch[1].toLowerCase() === "today" ? 0 : dateMatch[1].toLowerCase() === "tomorrow" ? 1 : 7) : dayOffset(1);
        const subjectMatch = detail.match(/\bsubject\s*:\s*([^,;]+?)(?=\s*,?\s*(?:high|medium|low)\s+priority|\s*,?\s*(?:due\s+)?(?:today|tomorrow|next week)\b|$)/i);
        const title = detail
          .replace(/\bsubject\s*:\s*[^,;]+/i, "")
          .replace(/\b(?:high|medium|low)\s+priority\b/ig, "")
          .replace(/\b(?:due\s+)?(?:today|tomorrow|next week)\b/ig, "")
          .replace(/[,;]\s*$/, "").trim();
        if (!title) {
          setPendingAction({ type: "create-title" });
          response = "What should I call the task? For example, “add a task: review Biology notes.”";
        } else {
          const task = { id: crypto.randomUUID(), title, subject: subjectMatch?.[1]?.trim() || "General", priority, dueDate, completed: false };
          setTasks((current) => [task, ...current]);
          response = `Added “${title}” to your ${task.subject} tasks with ${priority.toLowerCase()} priority, due ${dateMatch?.[1]?.toLowerCase() || "tomorrow"}. Would you like me to plan time for it?`;
        }
      }
    } else if (/^(complete|finish|done|mark)\b/.test(normalized)) {
      const target = trimmed.replace(/^(?:please\s+)?(?:complete|finish|done|mark)\s+(?:task\s+)?(?:as\s+)?(?:done\s+)?/i, "").replace(/\s+(?:as\s+)?(?:done|complete)$/i, "").trim().toLowerCase();
      const matches = tasks.filter((task) => task.title.toLowerCase().includes(target));
      if (target && matches.length === 1) response = applyTaskAction("complete", matches[0]);
      else { setPendingAction({ type: "complete" }); response = matches.length ? "I found more than one match. Which task should I mark complete?" : "Which task would you like me to mark complete? Tell me its name."; }
    } else if (/^(delete|remove)\b/.test(normalized)) {
      const target = trimmed.replace(/^(?:please\s+)?(?:delete|remove)\s+(?:the\s+)?(?:task\s+)?/i, "").trim().toLowerCase();
      const matches = tasks.filter((task) => task.title.toLowerCase().includes(target));
      if (target && matches.length === 1) response = applyTaskAction("delete", matches[0]);
      else { setPendingAction({ type: "delete" }); response = matches.length ? "I found more than one match. Which task should I remove?" : "Which task should I remove? Tell me the task name."; }
    } else if (/^(edit|update|rename|change)\b/.test(normalized)) {
      const editMatch = trimmed.match(/^(?:please\s+)?(?:edit|update|rename|change)\s+(?:the\s+)?(?:task\s+)?(.+)$/i);
      const targetAndTitle = editMatch?.[1]?.trim() || "";
      const renameParts = targetAndTitle.match(/^(.+?)\s+to\s+(.+)$/i);
      const target = (renameParts?.[1] || targetAndTitle).toLowerCase();
      const newTitle = renameParts?.[2]?.trim();
      const matches = tasks.filter((task) => task.title.toLowerCase().includes(target));
      if (target && matches.length === 1) response = applyTaskAction("edit", matches[0], newTitle);
      else { setPendingAction({ type: "edit", newTitle }); response = matches.length ? "I found more than one match. Which task would you like to edit?" : "Which task would you like to edit? Tell me its name."; }
    } else if (normalized.includes("progress") || normalized.includes("how am i doing")) {
      const overdue = pendingTasks.filter((task) => task.dueDate && task.dueDate < dayOffset(0));
      const dueToday = pendingTasks.filter((task) => task.dueDate === dayOffset(0));
      const bySubject = [...new Set(pendingTasks.map((task) => task.subject))];
      response = `You’ve completed ${completedCount} of ${tasks.length} tasks (${progress}%). ${pendingTasks.length ? `${pendingTasks.length} remain${overdue.length ? `, including ${overdue.length} overdue` : ""}${dueToday.length ? ` and ${dueToday.length} due today` : ""}. ${bySubject.length ? `Your open subjects: ${bySubject.join(", ")}.` : ""}` : "Everything is complete. Enjoy the breathing room!"}`;
    }
    else if (normalized.includes("help") || normalized.includes("what can you")) response = "I can plan your day from your pending tasks, create a practical exam revision checklist, or give you a quick progress update. Try one of the quick actions below!";
    else response = "I’m your on-device StudyFlow helper, so I don’t send messages to an AI service. Try “Plan my day,” “Prepare for an exam,” or “How am I doing?” and I’ll help using your task list.";
    addChat("assistant", response);
    if (speakReplies) speakText(response);
  }

  function saveTask(task) {
    if (editor?.task) setTasks((current) => current.map((item) => item.id === task.id ? task : item));
    else setTasks((current) => [{ ...task, id: crypto.randomUUID(), completed: false }, ...current]);
    setEditor(null);
    setToast(editor?.task ? "Task updated." : "Task added to your list.");
  }

  function clearTasks() {
    if (!tasks.length) return setToast("Your task list is already clear.");
    if (!window.confirm("Clear all tasks? This cannot be undone.")) return;
    setTasks([]);
    setToast("All tasks cleared. Add a new task whenever you’re ready.");
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActiveView("Overview")} aria-label="StudyFlow home">
          <span className="brand-mark"><Icon name="spark" size={21} /></span><span>studyflow<span className="brand-dot">.</span><small>YOUR STUDY SPACE</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {[["Overview", "home"], ["My Tasks", "list"], ["Schedule", "calendar"]].map(([label, icon]) => (
            <button key={label} className={`nav-item ${activeView === label ? "active" : ""}`} aria-label={label} onClick={() => setActiveView(label)}><Icon name={icon} /><span>{label}</span>{label === "My Tasks" && <span className="nav-count">{pendingTasks.length}</span>}</button>
          ))}
        </nav>
        <div className="side-label subject-label">YOUR SUBJECTS</div>
        <div className="subject-list">{[...new Set(tasks.map((task) => task.subject))].slice(0, 4).map((subject, index) => <button key={subject} className="subject-item" onClick={() => { setSearch(subject); setActiveView("My Tasks"); }}><span className={`subject-dot dot-${index}`} />{subject}</button>)}</div>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span className="tip-icon"><Icon name="spark" size={16} /></span><strong>A little progress<br />goes a long way.</strong><p>Small steps add up to big wins.</p><button onClick={() => sendMessage("Plan my day")}>Make a plan <Icon name="arrow" size={14} /></button></div>
          <div className="user-profile"><span className="avatar">N</span><span><strong>Nandana</strong><small>STUDENT</small></span><span className="profile-menu">•••</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-brand" onClick={() => setActiveView("Overview")}><span className="brand-mark"><Icon name="spark" size={19} /></span>studyflow<span className="brand-dot">.</span></button>
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{activeView}</strong></div>
          <div className="top-actions">
            <label className="search-box"><Icon name="search" size={17} /><input aria-label="Search tasks" placeholder="Search anything..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setToast(todayTasks ? `You have ${todayTasks} task${todayTasks === 1 ? "" : "s"} due today.` : "You’re all clear for today — nice work.")}><Icon name="bell" /><i /></button>
            <span className="top-avatar">N</span>
          </div>
        </header>

        {storageError && <div className="storage-alert" role="alert">{storageError}<button aria-label="Dismiss error" onClick={() => setStorageError("")}><Icon name="close" size={15} /></button></div>}

        {activeView === "Schedule" ? (
          <div className="page-content">
            <section className="page-heading"><div><span className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}</span><h1>Your schedule<span className="heading-period">.</span></h1><p>A calm plan for making progress, one block at a time.</p></div><button className="button button-primary" onClick={() => sendMessage("Plan my day")}><Icon name="spark" size={16} /> Plan my day</button></section>
            <AssistantStage chat={chat} message={message} setMessage={setMessage} sendMessage={sendMessage} isListening={isListening} voiceError={voiceError} speechSupported={speechSupported} startListening={startListening} speakReplies={speakReplies} setSpeakReplies={setSpeakReplies} speakText={speakText} />
            <section className="schedule-page-card"><div className="section-title"><div><h2>Today’s focus</h2><p>Your plan is always one small step away.</p></div><span className="today-pill"><span /> TODAY</span></div>{pendingTasks.length ? pendingTasks.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "")).map((task, i) => <div className="schedule-row" key={task.id}><span className="schedule-time">{["9:00 AM", "10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM"][i % 5]}</span><span className="schedule-line" /><span className="schedule-block"><span className={`task-subject-icon subject-icon-${i % 4}`}><Icon name="book" size={17} /></span><span><strong>{task.title}</strong><small>{task.subject} · 45 min focus</small></span><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span></span></div>) : <div className="empty-state"><span className="empty-icon"><Icon name="calendar" size={24} /></span><h3>Nothing on the schedule yet</h3><p>Add a task and we’ll help you make a plan.</p><button className="button button-primary" onClick={() => setEditor({ task: null })}><Icon name="plus" size={16} /> Add a task</button></div>}</section>
          </div>
        ) : (
          <div className="page-content">
            <section className="page-heading"><div><span className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}</span><h1>{activeView === "My Tasks" ? "Your tasks" : `${greeting}, Nandana`}<span className="heading-period">.</span></h1><p>{activeView === "My Tasks" ? "A clear list makes room for clear thinking." : "One step at a time. You’re right where you need to be."}</p></div><button className="button button-primary" onClick={() => setEditor({ task: null })}><Icon name="plus" size={17} /> Add a task</button></section>

            <AssistantStage chat={chat} message={message} setMessage={setMessage} sendMessage={sendMessage} isListening={isListening} voiceError={voiceError} speechSupported={speechSupported} startListening={startListening} speakReplies={speakReplies} setSpeakReplies={setSpeakReplies} speakText={speakText} />

            {activeView === "Overview" && <section className="stats-grid">
              <article className="stat-card"><span className="stat-icon lavender"><Icon name="list" /></span><span className="stat-label">TOTAL TASKS</span><strong>{tasks.length.toString().padStart(2, "0")}</strong><small>Things you want to get done</small><span className="stat-decoration deco-lavender" /></article>
              <article className="stat-card"><span className="stat-icon mint"><Icon name="check" /></span><span className="stat-label">COMPLETED</span><strong>{completedCount.toString().padStart(2, "0")}<small className="stat-of"> / {tasks.length.toString().padStart(2, "0")}</small></strong><small>Every little win counts</small><span className="stat-decoration deco-mint" /></article>
              <article className="stat-card"><span className="stat-icon peach"><Icon name="clock" /></span><span className="stat-label">DUE TODAY</span><strong>{todayTasks.toString().padStart(2, "0")}</strong><small>{todayTasks ? "Let’s take these one at a time" : "A little breathing room"}</small><span className="stat-decoration deco-peach" /></article>
              <article className="stat-card progress-card"><span className="stat-icon cyan"><Icon name="spark" /></span><span className="stat-label">YOUR PROGRESS</span><strong>{progress}<small className="stat-of">%</small></strong><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>Look how far you’ve come</small></article>
            </section>}

            <div className="dashboard-grid">
              <section className="tasks-panel">
                <div className="section-title"><div><span className="eyebrow">{activeView === "My Tasks" ? "YOUR WORK, YOUR PACE" : "KEEP THE MOMENTUM"}</span><h2>{activeView === "My Tasks" ? "My tasks" : "On your list"} <span className="count-badge">{visibleTasks.length}</span></h2></div><button className="text-button" onClick={clearTasks}>Clear all <Icon name="trash" size={14} /></button></div>
                <div className="task-toolbar"><div className="filter-tabs" role="group" aria-label="Filter tasks by priority">{["All", "High", "Medium", "Low"].map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><button className="toolbar-add" onClick={() => setEditor({ task: null })}><Icon name="plus" size={15} /> Add new</button></div>
                <div className="task-list">
                  {visibleTasks.length ? visibleTasks.map((task, index) => <article className={`task-row ${task.completed ? "task-complete" : ""}`} key={task.id}>
                    <button className={`task-check ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task.id)} aria-label={`${task.completed ? "Mark incomplete" : "Complete"} ${task.title}`}>{task.completed && <Icon name="check" size={14} />}</button>
                    <span className={`task-subject-icon subject-icon-${index % 4}`}><Icon name="book" size={17} /></span>
                    <div className="task-main"><strong>{task.title}</strong><span>{task.subject}</span></div>
                    <span className={`priority priority-${task.priority.toLowerCase()}`}><i />{task.priority}</span>
                    <span className="task-due"><Icon name="calendar" size={14} />{formattedDate(task.dueDate)}</span>
                    <div className="task-controls"><button className="icon-button small-icon" aria-label={`Edit ${task.title}`} onClick={() => setEditor({ task })}><Icon name="edit" size={15} /></button><button className="icon-button small-icon delete-icon" aria-label={`Delete ${task.title}`} onClick={() => { setTasks((current) => current.filter((item) => item.id !== task.id)); setToast("Task removed."); }}><Icon name="trash" size={15} /></button></div>
                  </article>) : <div className="empty-state"><span className="empty-icon"><Icon name="list" size={24} /></span><h3>{search ? "No tasks found" : tasks.length ? "Nothing in this view" : "A fresh start"}</h3><p>{search ? "Try a different search or clear the search field." : tasks.length ? "Try another priority filter to see more." : "Add your first task and start building momentum."}</p>{!tasks.length && <button className="button button-primary" onClick={() => setEditor({ task: null })}><Icon name="plus" size={16} /> Add a task</button>}</div>}
                </div>
                <div className="task-footer"><span><span className="footer-dot" /> You’re doing great — keep it up</span><button onClick={() => setActiveView("My Tasks")}>View all tasks <Icon name="arrow" size={14} /></button></div>
              </section>

              <aside className="right-column">
                <section className="focus-panel"><div className="focus-heading"><span className="focus-icon"><Icon name="clock" size={17} /></span><div><strong>Focus time</strong><small>A little focus goes a long way</small></div><button className="focus-menu" aria-label="Reset focus timer" onClick={() => { setTimerRunning(false); setSeconds(25 * 60); setToast("Focus timer reset."); }}>↻</button></div><div className="timer-display"><span>{String(Math.floor(seconds / 60)).padStart(2, "0")}</span><i>:</i><span>{String(seconds % 60).padStart(2, "0")}</span><small>MINUTES</small></div><button className={`focus-button ${timerRunning ? "is-running" : ""}`} onClick={() => setTimerRunning((running) => !running)}>{timerRunning ? "Pause session" : "Start a focus session"} <Icon name={timerRunning ? "clock" : "arrow"} size={15} /></button></section>
              </aside>
            </div>
          </div>
        )}
      </main>
      {editor && <TaskEditor task={editor.task} onSave={saveTask} onClose={() => setEditor(null)} />}
      {toast && <div className="toast" role="status"><span><Icon name="check" size={16} /></span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast("")}><Icon name="close" size={14} /></button></div>}
    </div>
  );
}

export default App;
