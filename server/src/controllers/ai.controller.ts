import { Request, Response } from "express";
import { getCachedData, setCachedData } from "../config/redis";

// Simple cosine similarity helper
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB || 1);
};

// Simple pseudo-embedding generator for demo / vector similarity fallback
const getPseudoEmbedding = (text: string): number[] => {
  const vec = new Array(128).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[text.charCodeAt(i) % 128] += 1;
  }
  return vec;
};

// Standard mock RAG vector index over sample lecture notes
const LECTURE_KNOWLEDGE_BASE = [
  {
    id: "lecture-1",
    courseId: "course-js-101",
    lectureTitle: "Understanding Async JavaScript & Promises",
    content: "JavaScript is single-threaded. Async code executes in the event loop. Promises represent future values with pending, fulfilled, or rejected states. Async/await is syntactic sugar over promises.",
    embedding: getPseudoEmbedding("JavaScript single-threaded event loop Promises async await syntactic sugar"),
  },
  {
    id: "lecture-2",
    courseId: "course-node-advanced",
    lectureTitle: "Node.js Streams and Buffer Management",
    content: "Streams process data sequentially in chunks. Readable, Writable, Duplex, and Transform streams help handle huge files without exceeding memory limits.",
    embedding: getPseudoEmbedding("Streams Node.js Buffer Readable Writable Duplex Transform memory limits"),
  },
];

// 1. SSE Streaming AI Assistant (RAG Q&A)
export const handleAICourseAskStream = async (req: Request, res: Response) => {
  const { question, courseId } = req.query;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ success: false, message: "Question query parameter is required" });
  }

  // Setup Server-Sent Events headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // RAG Search step: Calculate similarity score
  const queryVec = getPseudoEmbedding(question);
  const matchedDocs = LECTURE_KNOWLEDGE_BASE.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryVec, doc.embedding),
  })).sort((a, b) => b.score - a.score);

  const topMatch = matchedDocs[0];
  const responseText = `[RAG Vector Citation: "${topMatch.lectureTitle}"] Based on the course materials: ${topMatch.content} In answer to your question "${question}", you should focus on how asynchronous execution uses promises and non-blocking tasks.`;

  // Stream answer token by token via SSE
  const tokens = responseText.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    res.write(`data: ${JSON.stringify({ token: tokens[i] + " ", done: i === tokens.length - 1 })}\n\n`);
    await new Promise((r) => setTimeout(r, 60));
  }

  res.end();
};

// 2. Auto-Generated Quiz with Redis Caching
export const handleGenerateQuiz = async (req: Request, res: Response) => {
  const { lectureId } = req.body;
  const cacheKey = `quiz:${lectureId || "default"}`;

  const cachedQuiz = await getCachedData(cacheKey);
  if (cachedQuiz) {
    return res.json({ success: true, source: "redis-cache", quiz: cachedQuiz });
  }

  // Simulated LLM quiz generation
  const generatedQuiz = [
    {
      id: "q1",
      question: "What is the event loop in JavaScript responsible for?",
      options: [
        "Executing synchronous code only",
        "Handling asynchronous callbacks and call stack monitoring",
        "Compiling JS code to C++",
        "Managing DOM elements directly",
      ],
      correctAnswerIndex: 1,
    },
    {
      id: "q2",
      question: "Which of the following is true about async/await?",
      options: [
        "It makes JavaScript multi-threaded",
        "It blocks the main thread completely",
        "It is built on top of Promises",
        "It replaces the need for functions",
      ],
      correctAnswerIndex: 2,
    },
  ];

  await setCachedData(cacheKey, generatedQuiz, 7200); // 2 hours
  return res.json({ success: true, source: "generated-llm", quiz: generatedQuiz });
};

// 3. Natural Language Intent Parsing Course Search
export const handleSmartCourseSearch = async (req: Request, res: Response) => {
  const { query } = req.query;
  const queryStr = String(query || "").toLowerCase();

  // Intent parsing rules
  let maxPrice = 999;
  let level = "all";
  let topic = "";

  const priceMatch = queryStr.match(/under \$?(\d+)/i);
  if (priceMatch) {
    maxPrice = Number(priceMatch[1]);
  }

  if (queryStr.includes("beginner")) level = "beginner";
  if (queryStr.includes("intermediate")) level = "intermediate";
  if (queryStr.includes("advanced")) level = "advanced";

  if (queryStr.includes("js") || queryStr.includes("javascript")) topic = "javascript";
  if (queryStr.includes("node")) topic = "node";

  return res.json({
    success: true,
    parsedIntent: { maxPrice, level, topic },
    query: queryStr,
    results: [
      {
        id: "c1",
        title: "Complete Async JavaScript & Node.js Masterclass",
        price: 19.99,
        level: "beginner",
        category: "javascript",
      },
    ],
  });
};
