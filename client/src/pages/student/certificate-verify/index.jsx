import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyCertificateService } from "@/services";
import { CheckCircle2, XCircle, Shield, Award } from "lucide-react";

export default function CertificateVerifyPage() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await verifyCertificateService(certificateId);
        if (res?.success) setCert(res.data);
        else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Certificate Not Found</h1>
        <p className="text-muted-foreground">
          The certificate ID <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{certificateId}</code> could not be verified.
        </p>
      </div>
    );
  }

  return (
    <div className="page-wrap py-12">
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-700">Certificate Verified ✓</h1>
        <p className="mt-1 text-sm text-muted-foreground">This certificate is authentic and issued by Elearn Adda.</p>

        <div className="mt-6 space-y-3 text-left">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Certificate ID</p>
              <p className="font-mono text-sm font-semibold">{cert.certificateId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Award className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Awarded To</p>
              <p className="text-sm font-semibold">{cert.userName}</p>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Course</p>
            <p className="text-sm font-semibold">{cert.courseTitle}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Instructor</p>
            <p className="text-sm font-semibold">{cert.instructorName}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Date of Completion</p>
            <p className="text-sm font-semibold">
              {new Date(cert.completionDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
