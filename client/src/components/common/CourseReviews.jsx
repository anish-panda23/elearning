import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { addReviewService, getCourseReviewsService } from "@/services";
import { Star, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function StarRating({ value, onChange, size = 20, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            size={size}
            className={`${
              star <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-gray-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-right text-muted-foreground">{stars}</span>
      <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-muted-foreground">{count}</span>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function CourseReviews({ courseId }) {
  const { auth } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, distribution: {} });
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadReviews() {
    const res = await getCourseReviewsService(courseId);
    if (res?.success) {
      setReviews(res.data.reviews);
      setStats(res.data.stats);
      // Pre-fill if user already reviewed
      const mine = res.data.reviews.find((r) => r.userId === auth?.user?._id);
      if (mine) {
        setMyRating(mine.rating);
        setMyText(mine.reviewText);
      }
    }
  }

  useEffect(() => {
    if (courseId) loadReviews();
  }, [courseId]);

  async function handleSubmit() {
    if (!myRating) return;
    setSubmitting(true);
    const res = await addReviewService({
      courseId,
      userId: auth?.user?._id,
      userName: auth?.user?.userName,
      rating: myRating,
      reviewText: myText,
    });
    if (res?.success) await loadReviews();
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 sm:flex-row">
        {/* Big number */}
        <div className="flex flex-col items-center justify-center gap-1 sm:min-w-[120px]">
          <span className="text-5xl font-extrabold">{stats.avgRating || "—"}</span>
          <StarRating value={Math.round(stats.avgRating)} readonly size={16} />
          <span className="text-sm text-muted-foreground">{stats.total} reviews</span>
        </div>
        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar key={star} stars={star} count={stats.distribution?.[star] || 0} total={stats.total} />
          ))}
        </div>
      </div>

      {/* Write review */}
      {auth?.user?._id && (
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <p className="font-semibold text-sm">Your review</p>
          <StarRating value={myRating} onChange={setMyRating} size={24} />
          <Textarea
            value={myText}
            onChange={(e) => setMyText(e.target.value)}
            placeholder="Share your experience with this course…"
            className="resize-none"
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={!myRating || submitting} size="sm">
            <Send className="mr-2 h-3.5 w-3.5" />
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </div>
      )}

      {/* Review cards */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-xl border bg-card p-4 flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{r.userName}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                </div>
                <StarRating value={r.rating} readonly size={14} />
                {r.reviewText && (
                  <p className="mt-1 text-sm text-muted-foreground">{r.reviewText}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
