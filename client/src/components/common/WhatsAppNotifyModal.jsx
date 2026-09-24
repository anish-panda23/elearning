import { useState, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { sendWhatsAppNotificationService } from "@/services";
import { MessageCircle, Send, Check, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WhatsAppNotifyModal({
  type = "enrollment", // "enrollment" | "certificate"
  courseData = {},
  triggerBtn,
}) {
  const { auth } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(auth?.user?.phone || "+91 98765 43210");
  const [loading, setLoading] = useState(false);
  const [sentResult, setSentResult] = useState(null);

  const userName = auth?.user?.userName || "Learner";
  const courseTitle = courseData.title || courseData.courseTitle || "Full Stack Web Development";
  const instructorName = courseData.instructorName || "Elearn Adda Team";
  const certificateId = courseData.certificateId || "CERT-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  
  const siteUrl = window.location.origin;
  const courseUrl = courseData.courseId ? `${siteUrl}/course-progress/${courseData.courseId}` : `${siteUrl}/student-courses`;
  const certificateUrl = `${siteUrl}/certificate-verify/${certificateId}`;

  // Formatted preview text
  const previewText =
    type === "enrollment"
      ? `🎉 *Course Enrollment Confirmed!*\n\nHi ${userName}, welcome to *${courseTitle}* on Elearn Adda! 🎓\n\n📚 *Instructor*: ${instructorName}\n🔗 *Start Learning Now*: ${courseUrl}\n\nHappy learning! 🚀`
      : `🏆 *Congratulations! You've Earned a Badge & Certificate!*\n\nHi ${userName}, outstanding work completing *${courseTitle}*! 🌟\n\n🏅 *Badge*: Master Specialist\n📜 *Certificate ID*: ${certificateId}\n🔗 *View Certificate*: ${certificateUrl}\n\nShowcase your new skill! 🚀`;

  async function handleSend() {
    if (!phone.trim()) return;
    setLoading(true);
    setSentResult(null);

    try {
      const payload = {
        phone: phone.trim(),
        type,
        data: {
          userName,
          courseTitle,
          instructorName,
          courseUrl,
          certificateUrl,
          certificateId,
        },
      };

      const res = await sendWhatsAppNotificationService(payload);
      if (res.success) {
        setSentResult(res);
        // Automatically open WhatsApp Web / App pre-filled with the message
        if (res.whatsappWebUrl) {
          window.open(res.whatsappWebUrl, "_blank");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerBtn || (
          <Button variant="outline" className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
            <MessageCircle className="h-4 w-4 text-emerald-500" />
            WhatsApp Alert
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl border-emerald-500/20 bg-slate-950 text-slate-100 p-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                WhatsApp {type === "enrollment" ? "Enrollment Notice" : "Badge & Certificate"}
              </DialogTitle>
              <p className="text-xs opacity-90">Instant Udemy-style WhatsApp delivery</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Phone Input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              WhatsApp Phone Number
            </label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="bg-slate-900 border-slate-800 text-white focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          {/* WhatsApp Chat Simulation Card */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              WhatsApp Message Preview
            </label>
            <div className="mt-1.5 rounded-xl border border-emerald-900/40 bg-[#0b141a] p-3 text-xs leading-relaxed text-slate-200 shadow-inner">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5 text-emerald-400 font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Elearn Adda Bot
              </div>
              <div className="whitespace-pre-wrap font-sans bg-[#111b21] p-3 rounded-lg border border-white/5">
                {previewText}
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {sentResult && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-3 text-xs text-emerald-300">
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Notification generated! Opening WhatsApp Web preview...
              </span>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleSend}
            disabled={loading}
            className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-900/20"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4" /> Send to WhatsApp Now
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
