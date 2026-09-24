import { useState, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { submitPlacementAssessmentService } from "@/services";
import { ShieldCheck, Award, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: "In Node.js event-driven architecture, what handles asynchronous non-blocking I/O operations?",
    options: ["Event Loop (libuv)", "V8 Call Stack", "Thread Pool only", "Express Middleware"],
    correct: 0,
  },
  {
    id: 2,
    question: "What is the primary purpose of React.useMemo() hook?",
    options: [
      "To mutate DOM directly",
      "To memoize expensive calculation results between renders",
      "To store global Redux state",
      "To fetch API data asynchronously",
    ],
    correct: 1,
  },
  {
    id: 3,
    question: "Which HTTP status code represents a successful REST API resource creation?",
    options: ["200 OK", "201 Created", "302 Found", "400 Bad Request"],
    correct: 1,
  },
  {
    id: 4,
    question: "How do MongoDB indexes improve query performance?",
    options: [
      "By compressing database storage",
      "By creating B-Tree structures to quickly locate matching documents without full collection scans",
      "By auto-encrypting passwords",
      "By converting JSON to XML",
    ],
    correct: 1,
  },
  {
    id: 5,
    question: "What does JWT (JSON Web Token) signature verify?",
    options: [
      "That the payload was not tampered with after being issued by the server",
      "User password in plaintext",
      "Database schema version",
      "IP address location",
    ],
    correct: 0,
  },
];

export default function PlacementTestModal({
  courseTitle = "Full Stack Web Development",
  courseId = "default-course",
  certificateId = "CERT-SAMPLE",
  onPassed,
  triggerBtn,
}) {
  const { auth } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSelect(questionId, optionIdx) {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  }

  async function handleSubmit() {
    let scoreCount = 0;
    SAMPLE_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) scoreCount += 20;
    });

    setSubmitting(true);
    try {
      const payload = {
        userId: auth?.user?._id || "user-123",
        userName: auth?.user?.userName || "Learner",
        userEmail: auth?.user?.userEmail || "learner@example.com",
        courseId,
        certificateId,
        score: scoreCount,
      };

      const res = await submitPlacementAssessmentService(payload);
      setResult(res);
      setSubmitted(true);
      if (res.isEligible && onPassed) {
        onPassed();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setCurrentStep(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerBtn || (
          <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-amber-900/20">
            <Award className="h-4 w-4" />
            Take Placement Eligibility Test
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl bg-slate-950 border-slate-800 text-slate-100 p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                Certified Placement Assessment
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Score ≥ 60% to unlock Verified Job Board placement access.
              </p>
            </div>
          </div>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-5 mt-3">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800 pb-3">
              <span>Question {currentStep + 1} of {SAMPLE_QUESTIONS.length}</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="h-3.5 w-3.5" /> 5 mins
              </span>
            </div>

            {/* Current Question */}
            {(() => {
              const q = SAMPLE_QUESTIONS[currentStep];
              const chosen = selectedAnswers[q.id];

              return (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-white leading-relaxed">
                    Q{currentStep + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelect(q.id, idx)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border ${
                          chosen === idx
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <span className="inline-block w-5 font-bold text-amber-400">{String.fromCharCode(65 + idx)}.</span> {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Step Controls */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((p) => p - 1)}
                className="border-slate-800 text-slate-300"
              >
                Previous
              </Button>

              {currentStep < SAMPLE_QUESTIONS.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentStep((p) => p + 1)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={submitting || Object.keys(selectedAnswers).length < SAMPLE_QUESTIONS.length}
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg"
                >
                  {submitting ? "Evaluating..." : "Submit Assessment"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Result View */
          <div className="text-center py-6 space-y-4">
            {result?.isEligible ? (
              <div className="space-y-3">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400 animate-bounce" />
                <h3 className="text-2xl font-extrabold text-white">Assessment Passed! 🎉</h3>
                <p className="text-sm text-emerald-400 font-semibold">
                  Score: {result?.data?.score}% — Verified Placement Eligible Badge Awarded!
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your profile and verified certificate link have been unlocked for Naukri & LinkedIn job partner referrals.
                </p>
                <Button
                  onClick={() => setOpen(false)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8"
                >
                  Explore Eligible Jobs Now
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <XCircle className="mx-auto h-16 w-16 text-rose-500" />
                <h3 className="text-xl font-bold text-white">Score: {result?.data?.score || 0}%</h3>
                <p className="text-xs text-slate-400">
                  Minimum passing score is 60%. Review course notes and try again!
                </p>
                <Button onClick={handleReset} variant="outline" className="border-slate-800 text-slate-300">
                  Re-take Assessment
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
