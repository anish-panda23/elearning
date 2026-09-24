import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  fetchJobsService,
  applyJobService,
  createJobService,
  checkPlacementEligibilityService,
  getUserCertificatesService,
} from "@/services";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Award,
  ExternalLink,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Send,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PlacementTestModal from "@/components/common/PlacementTestModal";

export default function StudentJobsPage() {
  const { auth } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({});
  const [postJobOpen, setPostJobOpen] = useState(false);

  // New Job Form
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "Remote",
    salary: "₹10 - 15 LPA",
    description: "",
    skills: "",
    naukriUrl: "https://www.naukri.com",
  });

  const userId = auth?.user?._id || "user-123";

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsRes, eligRes, certsRes] = await Promise.all([
          fetchJobsService(),
          checkPlacementEligibilityService(userId),
          getUserCertificatesService(userId),
        ]);

        if (jobsRes?.success) setJobs(jobsRes.data);
        if (eligRes?.success && eligRes.eligibleCount > 0) setIsEligible(true);
        if (certsRes?.success) setCertificates(certsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  async function handleApply(job) {
    if (!isEligible && certificates.length === 0) {
      alert("Please earn a certificate or pass the Placement Assessment to apply!");
      return;
    }

    try {
      const certId = certificates[0]?.certificateId || "CERT-VERIFIED";
      const payload = {
        jobId: job._id,
        userId,
        userName: auth?.user?.userName || "Learner",
        userEmail: auth?.user?.userEmail || "learner@example.com",
        certificateId: certId,
      };

      const res = await applyJobService(payload);
      if (res.success) {
        setAppliedJobs((prev) => ({ ...prev, [job._id]: true }));
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePostJob(e) {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description) return;
    try {
      const res = await createJobService(newJob);
      if (res.success) {
        setJobs((prev) => [res.data, ...prev]);
        setPostJobOpen(false);
        setNewJob({
          title: "",
          company: "",
          location: "Remote",
          salary: "₹10 - 15 LPA",
          description: "",
          skills: "",
          naukriUrl: "https://www.naukri.com",
        });
        alert("Job posting published successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page-wrap py-8 space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl border border-indigo-900/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Verified Job & Hiring Board
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Connect Your Verified Certificates to Top Tech Employers
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Direct placement partner network integrated with <strong className="text-white">Naukri.com</strong> & <strong className="text-white">LinkedIn Jobs</strong>. Certified students unlock 1-click verified applications.
          </p>
        </div>

        {/* Action Button for Admin or Placement Test */}
        <div className="flex flex-col sm:flex-row gap-3">
          <PlacementTestModal onPassed={() => setIsEligible(true)} />

          {(auth?.user?.role === "instructor" || auth?.user?.role === "admin") && (
            <Dialog open={postJobOpen} onOpenChange={setPostJobOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold">
                  <PlusCircle className="h-4 w-4" /> Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-slate-100 p-6 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Post a Job Opening</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePostJob} className="space-y-3 mt-2">
                  <Input
                    placeholder="Job Title (e.g. Senior MERN Developer)"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-white"
                    required
                  />
                  <Input
                    placeholder="Company Name (e.g. TechCorp)"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-white"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Location (e.g. Remote)"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-white"
                    />
                    <Input
                      placeholder="Salary (e.g. ₹12 - 18 LPA)"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-white"
                    />
                  </div>
                  <Input
                    placeholder="Job Description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-white"
                    required
                  />
                  <Input
                    placeholder="Naukri.com URL"
                    value={newJob.naukriUrl}
                    onChange={(e) => setNewJob({ ...newJob, naukriUrl: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-white"
                  />
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                    Publish Job Listing
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Placement Status Card */}
      <div className={`rounded-2xl p-5 border flex items-center justify-between gap-4 ${
        isEligible || certificates.length > 0
          ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
          : "bg-amber-950/30 border-amber-500/30 text-amber-300"
      }`}>
        <div className="flex items-center gap-3">
          {isEligible || certificates.length > 0 ? (
            <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
          ) : (
            <Lock className="h-7 w-7 text-amber-400 shrink-0" />
          )}
          <div>
            <h3 className="font-bold text-sm">
              {isEligible || certificates.length > 0
                ? "Verified Placement Eligible Status: ACTIVE"
                : "Placement Status: Assessment Required"}
            </h3>
            <p className="text-xs opacity-90">
              {isEligible || certificates.length > 0
                ? `You have earned ${certificates.length} certificate(s) & passed placement test. You can apply with 1-click verification!`
                : "Earn any course certificate or pass the Placement Assessment test to unlock 1-click verified recruiter applications."}
            </p>
          </div>
        </div>
      </div>

      {/* Job Postings Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Active Job Listings ({jobs.length})
        </h2>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job) => {
              const isApplied = appliedJobs[job._id];

              return (
                <div
                  key={job._id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                          {job.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                          <Building2 className="h-3.5 w-3.5" /> {job.company}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Award className="h-3.5 w-3.5" /> {job.requiredCertificate}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => handleApply(job)}
                      disabled={isApplied}
                      className={`flex-1 gap-1.5 text-xs font-bold ${
                        isApplied
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" /> Apply with Certificate
                        </>
                      )}
                    </Button>

                    <a
                      href={job.naukriUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Naukri <ExternalLink className="h-3 w-3 text-blue-500" />
                    </a>

                    <a
                      href={job.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      LinkedIn <ExternalLink className="h-3 w-3 text-blue-400" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
