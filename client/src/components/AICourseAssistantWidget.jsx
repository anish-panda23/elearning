import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Brain, X, RotateCcw, Mic, MicOff, Trash2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");
const AI_BASE = `${API_BASE}/ai`;

/* ─── Quick Suggestion Chips ───────────────────────────── */
const SUGGESTIONS = [
  "💡 Summarize this lecture",
  "⚡ Give me a code example",
  "🎓 Explain step-by-step",
  "❓ Quiz me on key concepts",
];

/* ─── Tab: AI Q&A Chat ───────────────────────────────────── */
function ChatTab({ courseId }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm your AI course assistant. Ask me anything about the lectures, concepts, or code you're learning.",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion((prev) => (prev ? prev + " " + transcript : transcript));
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  function toggleVoice() {
    if (!recognitionRef.current) {
      alert("Voice input is not supported on this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }

  function handleClear() {
    setMessages([
      {
        role: "assistant",
        text: "👋 Hi! I'm your AI course assistant. Ask me anything about the lectures, concepts, or code you're learning.",
      },
    ]);
  }

  function handleExport() {
    const chatText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join("\n\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-course-chat-notes.txt";
    a.click();
  }

  async function handleSend(customText) {
    const query = typeof customText === "string" ? customText : question;
    if (!query.trim() || isStreaming) return;

    const userQ = query.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: userQ }]);
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    try {
      const response = await fetch(
        `${AI_BASE}/ask-stream?question=${encodeURIComponent(userQ)}&courseId=${courseId || ""}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(sessionStorage.getItem("accessToken") || '""')}`,
          },
        }
      );
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setMessages((prev) => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  text: msgs[msgs.length - 1].text + data.token,
                };
                return msgs;
              });
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", text: "⚠️ Could not connect to AI assistant. Make sure the server is running." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="ai-tab-content">
      {/* Subheader Toolbar */}
      <div className="ai-toolbar">
        <button onClick={handleExport} className="ai-tool-btn" title="Export Notes">
          <Download size={13} /> Export
        </button>
        <button onClick={handleClear} className="ai-tool-btn" title="Clear Chat">
          <Trash2 size={13} /> Clear
        </button>
      </div>

      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-message ai-message--${m.role}`}>
            {m.role === "assistant" && <span className="ai-avatar">✦</span>}
            <div className="ai-bubble">
              {m.text}
              {isStreaming && i === messages.length - 1 && m.role === "assistant" && (
                <span className="ai-cursor" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="ai-chips">
        {SUGGESTIONS.map((chip, idx) => (
          <button
            key={idx}
            className="ai-chip"
            onClick={() => handleSend(chip)}
            disabled={isStreaming}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div className="ai-input-row">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isListening ? "Listening..." : "Ask AI or speak..."}
          className="ai-input"
          disabled={isStreaming}
        />
        <button
          className={`ai-voice-btn ${isListening ? "ai-voice-btn--active" : ""}`}
          onClick={toggleVoice}
          title="Voice Dictation"
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>
        <button className="ai-send-btn" onClick={() => handleSend()} disabled={isStreaming}>
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── Tab: AI Quiz ───────────────────────────────────────── */
function QuizTab({ courseId, lectureTitle }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  async function loadQuiz() {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    try {
      const token = JSON.parse(sessionStorage.getItem("accessToken") || '""');
      const res = await fetch(`${AI_BASE}/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, lectureTitle }),
      });
      const data = await res.json();
      if (data.success) setQuiz(data.quiz);
    } catch {
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(questionId, idx) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: idx }));
  }

  function handleSubmit() {
    if (!quiz) return;
    let correct = 0;
    quiz.forEach((q) => {
      if (answers[q.id] === q.correctAnswerIndex) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  }

  if (!quiz && !loading) {
    return (
      <div className="ai-quiz-empty">
        <Brain size={32} className="ai-quiz-empty-icon" />
        <p>Test your knowledge on the current lecture!</p>
        <button className="ai-quiz-generate-btn" onClick={loadQuiz}>
          <Sparkles size={14} /> Generate Quiz
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ai-quiz-empty">
        <div className="ai-spinner" />
        <p>Generating quiz…</p>
      </div>
    );
  }

  return (
    <div className="ai-quiz-content">
      {submitted && (
        <div
          className={`ai-score-banner ${
            score === quiz.length
              ? "ai-score-perfect"
              : score >= quiz.length / 2
              ? "ai-score-good"
              : "ai-score-low"
          }`}
        >
          {score === quiz.length
            ? "🎉 Perfect score!"
            : score >= quiz.length / 2
            ? "👍 Good job!"
            : "📖 Keep studying!"}
          &nbsp; {score}/{quiz.length} correct
        </div>
      )}
      {quiz.map((q, qi) => {
        const chosen = answers[q.id];
        const correct = q.correctAnswerIndex;
        return (
          <div key={q.id} className="ai-question">
            <p className="ai-question-text">
              <span className="ai-q-num">Q{qi + 1}.</span> {q.question}
            </p>
            <div className="ai-options">
              {q.options.map((opt, oi) => {
                let cls = "ai-option";
                if (submitted) {
                  if (oi === correct) cls += " ai-option--correct";
                  else if (chosen === oi && oi !== correct) cls += " ai-option--wrong";
                  else cls += " ai-option--dim";
                } else if (chosen === oi) {
                  cls += " ai-option--selected";
                }
                return (
                  <button key={oi} className={cls} onClick={() => handleAnswer(q.id, oi)}>
                    <span className="ai-opt-letter">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="ai-explanation">💡 {q.explanation}</p>
            )}
          </div>
        );
      })}
      <div className="ai-quiz-actions">
        {!submitted ? (
          <button
            className="ai-quiz-submit-btn"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.length}
          >
            Submit Answers
          </button>
        ) : (
          <button className="ai-quiz-retry-btn" onClick={loadQuiz}>
            <RotateCcw size={13} /> New Quiz
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Widget ────────────────────────────────────────── */
export function AICourseAssistantWidget({ courseId, lectureTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("chat");

  return (
    <>
      <style>{widgetCSS}</style>

      {/* Floating trigger button */}
      {!isOpen && (
        <button className="ai-fab" onClick={() => setIsOpen(true)} title="AI Course Assistant">
          <Sparkles size={22} />
          <span className="ai-fab-label">AI Assistant</span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="ai-panel">
          {/* Header */}
          <div className="ai-panel-header">
            <div className="ai-panel-title">
              <Sparkles size={16} className="ai-panel-icon" />
              AI Course Assistant
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="ai-tabs">
            <button
              className={`ai-tab-btn ${tab === "chat" ? "ai-tab-btn--active" : ""}`}
              onClick={() => setTab("chat")}
            >
              💬 Q&A Chat
            </button>
            <button
              className={`ai-tab-btn ${tab === "quiz" ? "ai-tab-btn--active" : ""}`}
              onClick={() => setTab("quiz")}
            >
              🧠 Quiz Me
            </button>
          </div>

          {/* Tab content */}
          {tab === "chat" ? (
            <ChatTab courseId={courseId} />
          ) : (
            <QuizTab courseId={courseId} lectureTitle={lectureTitle} />
          )}
        </div>
      )}
    </>
  );
}

/* ─── Scoped CSS ─────────────────────────────────────────── */
const widgetCSS = `
  /* FAB */
  .ai-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    display: flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff; border: none; border-radius: 999px;
    padding: 12px 20px; font-size: 0.875rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 8px 32px rgba(124,58,237,0.5);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ai-fab:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.65); }

  /* Panel */
  .ai-panel {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    width: 380px; height: 560px;
    background: #0d0f16;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
    display: flex; flex-direction: column; overflow: hidden;
    animation: aiSlideUp 0.25s cubic-bezier(.4,0,.2,1);
    font-family: 'Inter', system-ui, sans-serif;
  }
  @keyframes aiSlideUp {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  /* Header & Toolbar */
  .ai-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2));
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .ai-panel-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.875rem; font-weight: 700; color: #fff;
  }
  .ai-panel-icon { color: #fbbf24; }
  .ai-close-btn {
    background: none; border: none; color: rgba(255,255,255,0.5);
    cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.15s;
  }
  .ai-close-btn:hover { color: #fff; }

  .ai-toolbar {
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 6px 12px; background: rgba(0,0,0,0.2);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .ai-tool-btn {
    display: flex; align-items: center; gap: 4px;
    background: none; border: none; color: rgba(255,255,255,0.5);
    font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: color 0.15s;
  }
  .ai-tool-btn:hover { color: #a78bfa; }

  /* Tabs */
  .ai-tabs {
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .ai-tab-btn {
    flex: 1; background: none; border: none; color: rgba(255,255,255,0.45);
    font-size: 0.78rem; font-weight: 600; padding: 10px;
    cursor: pointer; transition: color 0.15s, background 0.15s;
    border-bottom: 2px solid transparent;
  }
  .ai-tab-btn--active {
    color: #a78bfa;
    border-bottom-color: #7c3aed;
    background: rgba(124,58,237,0.08);
  }
  .ai-tab-btn:hover:not(.ai-tab-btn--active) { color: rgba(255,255,255,0.7); }

  /* Chat */
  .ai-tab-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
  .ai-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
  .ai-messages::-webkit-scrollbar { width: 4px; }
  .ai-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  .ai-message { display: flex; gap: 8px; }
  .ai-message--user { flex-direction: row-reverse; }
  .ai-avatar {
    width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg,#7c3aed,#4f46e5);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #fff; margin-top: 2px;
  }
  .ai-bubble {
    max-width: 82%; border-radius: 14px; padding: 8px 12px;
    font-size: 0.8rem; line-height: 1.55; white-space: pre-wrap;
  }
  .ai-message--assistant .ai-bubble {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e2e8f0;
    border-radius: 4px 14px 14px 14px;
  }
  .ai-message--user .ai-bubble {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
    border-radius: 14px 14px 4px 14px;
  }
  .ai-cursor {
    display: inline-block; width: 8px; height: 14px;
    background: #a78bfa; border-radius: 2px; margin-left: 3px;
    vertical-align: middle; animation: blink 0.8s step-end infinite;
  }
  @keyframes blink { 50% { opacity: 0; } }

  /* Chips */
  .ai-chips {
    display: flex; gap: 6px; overflow-x: auto; padding: 6px 12px;
    background: rgba(0,0,0,0.15); border-top: 1px solid rgba(255,255,255,0.04);
  }
  .ai-chips::-webkit-scrollbar { display: none; }
  .ai-chip {
    white-space: nowrap; font-size: 0.7rem; font-weight: 500;
    color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 999px;
    padding: 4px 10px; cursor: pointer; transition: all 0.15s;
  }
  .ai-chip:hover {
    background: rgba(124,58,237,0.2); border-color: #7c3aed; color: #fff;
  }

  .ai-input-row {
    display: flex; gap: 6px; padding: 10px 12px;
    border-top: 1px solid rgba(255,255,255,0.07);
    background: rgba(0,0,0,0.3);
  }
  .ai-input {
    flex: 1; background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: #fff !important; font-size: 0.8rem !important;
    border-radius: 10px !important;
  }
  .ai-input::placeholder { color: rgba(255,255,255,0.3) !important; }
  .ai-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.2) !important; }

  .ai-voice-btn {
    width: 34px; height: 34px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7);
    cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .ai-voice-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .ai-voice-btn--active { background: #ef4444; border-color: #f87171; color: #fff; animation: pulse 1s infinite; }
  @keyframes pulse { 50% { opacity: 0.7; } }

  .ai-send-btn {
    width: 34px; height: 34px; border-radius: 10px; border: none;
    background: linear-gradient(135deg,#7c3aed,#4f46e5);
    color: #fff; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: opacity 0.15s;
  }
  .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Quiz */
  .ai-quiz-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
    color: rgba(255,255,255,0.5); font-size: 0.82rem; text-align: center; padding: 24px;
  }
  .ai-quiz-empty-icon { color: #7c3aed; }
  .ai-quiz-generate-btn {
    display: flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff; border: none; border-radius: 10px;
    padding: 10px 20px; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; margin-top: 4px; transition: opacity 0.15s;
  }
  .ai-quiz-generate-btn:hover { opacity: 0.88; }

  .ai-quiz-content {
    flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 14px;
  }
  .ai-quiz-content::-webkit-scrollbar { width: 4px; }
  .ai-quiz-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  .ai-score-banner {
    border-radius: 10px; padding: 10px 14px; font-size: 0.82rem; font-weight: 700; text-align: center;
  }
  .ai-score-perfect { background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
  .ai-score-good    { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
  .ai-score-low     { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

  .ai-question { display: flex; flex-direction: column; gap: 8px; }
  .ai-question-text { font-size: 0.8rem; color: #e2e8f0; line-height: 1.5; margin: 0; }
  .ai-q-num { color: #a78bfa; font-weight: 700; margin-right: 4px; }

  .ai-options { display: flex; flex-direction: column; gap: 6px; }
  .ai-option {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 8px 10px; font-size: 0.77rem; color: #cbd5e1;
    cursor: pointer; text-align: left; transition: background 0.15s, border-color 0.15s;
  }
  .ai-option:hover:not(.ai-option--correct):not(.ai-option--wrong):not(.ai-option--dim) {
    background: rgba(124,58,237,0.12); border-color: rgba(124,58,237,0.4);
  }
  .ai-option--selected { background: rgba(124,58,237,0.2); border-color: #7c3aed; color: #fff; }
  .ai-option--correct  { background: rgba(52,211,153,0.12); border-color: #34d399; color: #34d399; }
  .ai-option--wrong    { background: rgba(239,68,68,0.12);  border-color: #f87171; color: #f87171; }
  .ai-option--dim      { opacity: 0.4; cursor: default; }
  .ai-opt-letter {
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(255,255,255,0.08); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700;
  }

  .ai-explanation {
    font-size: 0.72rem; color: rgba(255,255,255,0.45); margin: 0;
    padding: 6px 10px; background: rgba(255,255,255,0.03);
    border-radius: 6px; border-left: 2px solid #7c3aed;
    line-height: 1.5;
  }

  .ai-quiz-actions { display: flex; justify-content: center; padding-bottom: 4px; }
  .ai-quiz-submit-btn {
    background: linear-gradient(135deg,#7c3aed,#4f46e5);
    color: #fff; border: none; border-radius: 10px;
    padding: 10px 28px; font-size: 0.82rem; font-weight: 700;
    cursor: pointer; transition: opacity 0.15s;
  }
  .ai-quiz-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .ai-quiz-retry-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.65); border-radius: 10px;
    padding: 9px 20px; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .ai-quiz-retry-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

  .ai-spinner {
    width: 28px; height: 28px;
    border: 2px solid rgba(255,255,255,0.15);
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
