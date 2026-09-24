const express = require("express");
const {
  handleAICourseAskStream,
  handleGenerateQuiz,
  handleSmartCourseSearch,
} = require("../../controllers/ai-controller/index");

const router = express.Router();

// GET  /ai/ask-stream?question=...&courseId=...  → SSE streaming RAG answer
router.get("/ask-stream", handleAICourseAskStream);

// POST /ai/generate-quiz                         → returns 3 MCQ questions
router.post("/generate-quiz", handleGenerateQuiz);

// GET  /ai/smart-search?query=...               → NL intent-parsed course search
router.get("/smart-search", handleSmartCourseSearch);

module.exports = router;
