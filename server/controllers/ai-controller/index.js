// AI Controller — plain JS, runs in the main server.js process on port 5001
const Course = require("../../models/Course");

/* ─── Simple pseudo-embedding (no external API needed) ───── */
function getPseudoEmbedding(text) {
  const vec = new Array(128).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[text.charCodeAt(i) % 128] += 1;
  }
  return vec;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

/* ─── Static knowledge base (mock RAG docs) ──────────────── */
const KNOWLEDGE_BASE = [
  {
    id: "kb-1",
    title: "JavaScript Event Loop & Async",
    content:
      "JavaScript is single-threaded and uses an event loop to handle asynchronous operations. Promises represent future values with pending, fulfilled, or rejected states. Async/await is syntactic sugar built on top of Promises, making asynchronous code easier to read and write.",
    tags: ["javascript", "async", "promises", "event loop"],
  },
  {
    id: "kb-2",
    title: "React Components & Hooks",
    content:
      "React components can be functional or class-based. Functional components use Hooks like useState for local state, useEffect for side effects, useContext for consuming context, and useMemo/useCallback for performance optimisation.",
    tags: ["react", "hooks", "components", "useState", "useEffect"],
  },
  {
    id: "kb-3",
    title: "Node.js Streams & Buffers",
    content:
      "Node.js streams process data in chunks without loading everything into memory. There are four types: Readable, Writable, Duplex, and Transform. Buffer is a fixed-size chunk of memory used to store binary data.",
    tags: ["nodejs", "streams", "buffers", "memory"],
  },
  {
    id: "kb-4",
    title: "REST API Design Principles",
    content:
      "REST APIs use HTTP methods: GET to read, POST to create, PUT/PATCH to update, DELETE to remove. Resources are identified by URLs. Status codes communicate outcomes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error.",
    tags: ["api", "rest", "http", "express"],
  },
  {
    id: "kb-5",
    title: "MongoDB & Mongoose",
    content:
      "MongoDB is a NoSQL document database that stores data as BSON. Mongoose provides schema-based modelling for MongoDB in Node.js. Key concepts: Schema, Model, Document, populate (join), indexes, and aggregation pipelines.",
    tags: ["mongodb", "mongoose", "database", "nosql"],
  },
  {
    id: "kb-6",
    title: "CSS Flexbox & Grid",
    content:
      "Flexbox is a one-dimensional layout system ideal for rows or columns. Grid is two-dimensional and ideal for full-page layouts. Key flex properties: display:flex, flex-direction, justify-content, align-items, gap. Key grid properties: grid-template-columns, grid-template-rows, grid-area.",
    tags: ["css", "flexbox", "grid", "layout"],
  },
  {
    id: "kb-7",
    title: "Authentication & JWT",
    content:
      "JWT (JSON Web Token) is a compact, URL-safe token format. A JWT contains three parts: header, payload, signature. Access tokens are short-lived; refresh tokens are long-lived. Never store sensitive data in the JWT payload as it is base64-encoded, not encrypted.",
    tags: ["auth", "jwt", "security", "tokens"],
  },
  {
    id: "kb-8",
    title: "Python Data Types & OOP",
    content:
      "Python has built-in types: int, float, str, list, tuple, dict, set. OOP in Python uses classes with __init__ for constructors, self for instance reference, and supports inheritance and polymorphism. List comprehensions provide concise ways to create lists.",
    tags: ["python", "oop", "classes", "data types"],
  },
];

// pre-compute embeddings once
KNOWLEDGE_BASE.forEach((doc) => {
  doc.embedding = getPseudoEmbedding(doc.tags.join(" ") + " " + doc.content);
});

/* ─── In-memory quiz cache (no Redis required) ────────────── */
const quizCache = new Map();

/* ─── Quiz bank keyed by topic tags ──────────────────────── */
const QUIZ_BANK = {
  javascript: [
    {
      id: "q-js-1",
      question: "What is the JavaScript event loop responsible for?",
      options: [
        "Running synchronous code only",
        "Managing asynchronous callbacks and the call stack",
        "Compiling JavaScript to machine code",
        "Handling DOM mutations directly",
      ],
      correctAnswerIndex: 1,
      explanation: "The event loop monitors the call stack and callback queue, pushing callbacks onto the stack when it is empty.",
    },
    {
      id: "q-js-2",
      question: "Which statement about async/await is correct?",
      options: [
        "It makes JavaScript multi-threaded",
        "It blocks the main thread completely",
        "It is syntactic sugar built on top of Promises",
        "It replaces the need for functions entirely",
      ],
      correctAnswerIndex: 2,
      explanation: "async/await is syntactic sugar that makes Promise-based code look synchronous without blocking the thread.",
    },
    {
      id: "q-js-3",
      question: "What does a Promise's 'fulfilled' state mean?",
      options: [
        "The async operation is still running",
        "The async operation completed successfully with a value",
        "The async operation failed with an error",
        "The promise was cancelled",
      ],
      correctAnswerIndex: 1,
      explanation: "A fulfilled Promise means the asynchronous operation completed and produced a resulting value.",
    },
  ],
  react: [
    {
      id: "q-react-1",
      question: "Which React Hook is used to perform side effects?",
      options: ["useState", "useContext", "useEffect", "useReducer"],
      correctAnswerIndex: 2,
      explanation: "useEffect runs after render and is used for fetching data, subscriptions, or manually changing the DOM.",
    },
    {
      id: "q-react-2",
      question: "What does useState return?",
      options: [
        "Only the current state value",
        "A state value and a setter function",
        "An observable stream",
        "A Redux store slice",
      ],
      correctAnswerIndex: 1,
      explanation: "useState returns an array: [currentState, setterFunction]. Destructuring it gives you both.",
    },
  ],
  nodejs: [
    {
      id: "q-node-1",
      question: "Which type of Node.js stream allows both reading and writing?",
      options: ["Readable", "Writable", "Transform", "Duplex"],
      correctAnswerIndex: 3,
      explanation: "A Duplex stream is both readable and writable, like a TCP socket.",
    },
  ],
  css: [
    {
      id: "q-css-1",
      question: "Which CSS property defines the direction of flex items?",
      options: ["flex-wrap", "flex-direction", "align-items", "justify-content"],
      correctAnswerIndex: 1,
      explanation: "flex-direction sets whether items flow in a row or column.",
    },
  ],
  default: [
    {
      id: "q-gen-1",
      question: "What does REST stand for?",
      options: [
        "Remote Execution of Server Tasks",
        "Representational State Transfer",
        "Real-time Event Streaming Technology",
        "Recursive Encoding of Static Types",
      ],
      correctAnswerIndex: 1,
      explanation: "REST is an architectural style for distributed hypermedia systems using HTTP.",
    },
    {
      id: "q-gen-2",
      question: "Which HTTP method is idempotent and used to read a resource?",
      options: ["POST", "PUT", "GET", "PATCH"],
      correctAnswerIndex: 2,
      explanation: "GET is safe and idempotent — calling it multiple times does not change server state.",
    },
  ],
};

/* ════════════════════════════════════════════════════════════
   1.  SSE Streaming AI Q&A (RAG)
════════════════════════════════════════════════════════════ */
const handleAICourseAskStream = async (req, res) => {
  const { question, courseId } = req.query;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ success: false, message: "question param is required" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:5173");

  // RAG: find closest knowledge-base doc
  const queryVec = getPseudoEmbedding(question);
  const ranked = KNOWLEDGE_BASE.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryVec, doc.embedding),
  })).sort((a, b) => b.score - a.score);

  const top = ranked[0];

  // Build a helpful answer using the matched doc
  const answer =
    `📚 Based on "${top.title}":\n\n` +
    `${top.content}\n\n` +
    `💡 Regarding your question — "${question}" — ` +
    `focus on the core concepts above and how they apply to your current lecture. ` +
    `Feel free to ask follow-up questions for deeper clarification!`;

  // Stream token-by-token
  const words = answer.split(" ");
  for (let i = 0; i < words.length; i++) {
    const payload = JSON.stringify({ token: words[i] + " ", done: i === words.length - 1 });
    res.write(`data: ${payload}\n\n`);
    await new Promise((r) => setTimeout(r, 45));
  }

  res.end();
};

/* ════════════════════════════════════════════════════════════
   2.  Auto-Generated Quiz (with in-memory cache)
════════════════════════════════════════════════════════════ */
const handleGenerateQuiz = async (req, res) => {
  try {
    const { courseId, lectureTitle } = req.body;
    const cacheKey = `quiz:${courseId || "default"}:${lectureTitle || ""}`;

    if (quizCache.has(cacheKey)) {
      return res.json({ success: true, source: "cache", quiz: quizCache.get(cacheKey) });
    }

    // Try to look up course title to pick relevant questions
    let topicKey = "default";
    const titleLower = (lectureTitle || "").toLowerCase();

    if (titleLower.includes("javascript") || titleLower.includes("js") || titleLower.includes("async") || titleLower.includes("promise")) {
      topicKey = "javascript";
    } else if (titleLower.includes("react") || titleLower.includes("hook") || titleLower.includes("component")) {
      topicKey = "react";
    } else if (titleLower.includes("node") || titleLower.includes("stream") || titleLower.includes("buffer")) {
      topicKey = "nodejs";
    } else if (titleLower.includes("css") || titleLower.includes("flex") || titleLower.includes("grid") || titleLower.includes("style")) {
      topicKey = "css";
    }

    // If we have specific questions, use them; otherwise mix default
    const pool = [...(QUIZ_BANK[topicKey] || []), ...QUIZ_BANK.default];
    // Shuffle and pick 3
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);

    quizCache.set(cacheKey, shuffled);
    // Auto-expire after 2 hours
    setTimeout(() => quizCache.delete(cacheKey), 7200 * 1000);

    return res.json({ success: true, source: "generated", quiz: shuffled });
  } catch (err) {
    console.error("Quiz generation error:", err);
    return res.status(500).json({ success: false, message: "Quiz generation failed" });
  }
};

/* ════════════════════════════════════════════════════════════
   3.  Natural-Language Smart Course Search
════════════════════════════════════════════════════════════ */
const handleSmartCourseSearch = async (req, res) => {
  try {
    const queryStr = String(req.query.query || "").toLowerCase();

    let maxPrice = 9999;
    let level = null;
    let keywords = [];

    // Price intent
    const priceMatch = queryStr.match(/under\s*\$?(\d+)/i);
    if (priceMatch) maxPrice = Number(priceMatch[1]);

    // Level intent
    if (queryStr.includes("beginner") || queryStr.includes("basic") || queryStr.includes("introduction")) level = "beginner";
    if (queryStr.includes("intermediate")) level = "intermediate";
    if (queryStr.includes("advanced") || queryStr.includes("expert")) level = "advanced";

    // Topic keywords
    const topicWords = queryStr
      .replace(/under \$?\d+/gi, "")
      .replace(/(beginner|intermediate|advanced|basic|introduction|expert)/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    keywords = topicWords;

    // Build MongoDB query
    const dbQuery = { pricing: { $lte: maxPrice } };
    if (level) dbQuery.level = level;
    if (keywords.length) {
      dbQuery.$or = keywords.map((kw) => ({
        $or: [
          { title: { $regex: kw, $options: "i" } },
          { category: { $regex: kw, $options: "i" } },
          { description: { $regex: kw, $options: "i" } },
        ],
      }));
    }

    const courses = await Course.find(dbQuery).limit(6).select("_id title pricing level category image").lean();

    return res.json({
      success: true,
      parsedIntent: { maxPrice, level, keywords },
      results: courses,
    });
  } catch (err) {
    console.error("Smart search error:", err);
    return res.status(500).json({ success: false, message: "Smart search failed" });
  }
};

module.exports = { handleAICourseAskStream, handleGenerateQuiz, handleSmartCourseSearch };
