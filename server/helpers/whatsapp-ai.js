const Course = require("../models/Course");

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_TURNS = 10; // messages remembered per phone number
const HISTORY_TTL_MS = 60 * 60 * 1000;
const MAX_REPLY_CHARS = 1500; // keep well under WhatsApp's 4096 limit

// phone -> { messages: [{role, content}], updatedAt }
const conversations = new Map();

function getHistory(phone) {
  const entry = conversations.get(phone);
  if (!entry || Date.now() - entry.updatedAt > HISTORY_TTL_MS) return [];
  return entry.messages;
}

function saveHistory(phone, messages) {
  conversations.set(phone, { messages: messages.slice(-MAX_TURNS), updatedAt: Date.now() });
  if (conversations.size > 5000) {
    const oldest = [...conversations.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt)[0];
    if (oldest) conversations.delete(oldest[0]);
  }
}

async function buildSystemPrompt() {
  let catalog = "";
  try {
    const courses = await Course.find({ isPublised: true }).select("title category level pricing").limit(30).lean();
    if (courses.length) {
      catalog =
        "\n\nCourses currently available on Elearn Adda:\n" +
        courses.map((c) => `- ${c.title} (${c.category || "General"}, ${c.level || "all levels"}, $${c.pricing ?? "?"})`).join("\n");
    }
  } catch (_) {
    // catalog is optional context; ignore DB errors
  }
  return (
    "You are the Elearn Adda learning assistant on WhatsApp. Answer student questions about programming, " +
    "web development and the platform's courses clearly and accurately. Replies are read on a phone: keep them " +
    "short (under ~150 words), use plain text with WhatsApp formatting (*bold*, _italic_, ```code```), no markdown " +
    "headings or tables. If you don't know something about the platform (payments, refunds, account issues), say so " +
    "and suggest contacting support instead of guessing." +
    catalog
  );
}

async function callClaude(system, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

/**
 * Generate an AI answer to an incoming WhatsApp question, keeping short per-phone context.
 */
async function answerWhatsAppQuestion(phone, question) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "The assistant isn't configured yet. Please try again later.";
  }
  const history = getHistory(phone);
  const messages = [...history, { role: "user", content: question }];
  // Anthropic requires the first message to be from the user
  while (messages.length && messages[0].role !== "user") messages.shift();

  const reply = (await callClaude(await buildSystemPrompt(), messages)).slice(0, MAX_REPLY_CHARS);
  saveHistory(phone, [...messages, { role: "assistant", content: reply }]);
  return reply || "Sorry, I couldn't come up with an answer. Could you rephrase?";
}

module.exports = { answerWhatsAppQuestion };
