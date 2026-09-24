import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "@/context/auth-context";
import { getUserCertificatesService, generateCertificateService } from "@/services";
import { Award, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import WhatsAppNotifyModal from "@/components/common/WhatsAppNotifyModal";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function CertificateSVG({ cert }) {
  return (
    <svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" className="w-full rounded-2xl shadow-2xl">
      {/* Background */}
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="800" height="560" fill="url(#bg)" rx="16" />

      {/* Decorative border */}
      <rect x="16" y="16" width="768" height="528" rx="12" fill="none" stroke="url(#gold)" strokeWidth="1.5" strokeDasharray="6 4" />

      {/* Corner accents */}
      <circle cx="40" cy="40" r="4" fill="#fbbf24" />
      <circle cx="760" cy="40" r="4" fill="#fbbf24" />
      <circle cx="40" cy="520" r="4" fill="#fbbf24" />
      <circle cx="760" cy="520" r="4" fill="#fbbf24" />

      {/* Award icon */}
      <circle cx="400" cy="80" r="24" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" strokeWidth="1" />
      <text x="400" y="88" textAnchor="middle" fill="#fbbf24" fontSize="24">🏆</text>

      {/* Title */}
      <text x="400" y="140" textAnchor="middle" fill="#fbbf24" fontFamily="Georgia, serif" fontSize="28" fontWeight="bold">
        Certificate of Completion
      </text>

      {/* Subtitle */}
      <text x="400" y="175" textAnchor="middle" fill="#94a3b8" fontFamily="sans-serif" fontSize="13">
        This is to certify that
      </text>

      {/* Student name */}
      <text x="400" y="220" textAnchor="middle" fill="#ffffff" fontFamily="Georgia, serif" fontSize="32" fontWeight="bold">
        {cert.userName}
      </text>

      {/* Divider */}
      <line x1="250" y1="240" x2="550" y2="240" stroke="#fbbf24" strokeWidth="0.5" />

      {/* Completion text */}
      <text x="400" y="275" textAnchor="middle" fill="#94a3b8" fontFamily="sans-serif" fontSize="13">
        has successfully completed the course
      </text>

      {/* Course title */}
      <text x="400" y="315" textAnchor="middle" fill="#e2e8f0" fontFamily="sans-serif" fontSize="20" fontWeight="bold">
        {cert.courseTitle?.length > 50 ? cert.courseTitle.substring(0, 50) + "…" : cert.courseTitle}
      </text>

      {/* Instructor */}
      <text x="400" y="350" textAnchor="middle" fill="#64748b" fontFamily="sans-serif" fontSize="12">
        Instructed by {cert.instructorName}
      </text>

      {/* Date */}
      <text x="400" y="385" textAnchor="middle" fill="#64748b" fontFamily="sans-serif" fontSize="12">
        Completed on {formatDate(cert.completionDate)}
      </text>

      {/* Certificate ID */}
      <text x="400" y="415" textAnchor="middle" fill="#475569" fontFamily="monospace" fontSize="11">
        {cert.certificateId}
      </text>

      {/* QR code (embedded as image) */}
      {cert.qrCodeDataUrl && (
        <image href={cert.qrCodeDataUrl} x="340" y="430" width="120" height="120" opacity="0.9" />
      )}

      {/* Footer */}
      <text x="400" y="545" textAnchor="middle" fill="#334155" fontFamily="sans-serif" fontSize="9">
        Elearn Adda • Verified Digital Certificate
      </text>
    </svg>
  );
}

export default function CertificatesPage() {
  const { auth } = useContext(AuthContext);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    if (!auth?.user?._id) return;
    const res = await getUserCertificatesService(auth.user._id);
    if (res?.success) setCertificates(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [auth?.user?._id]);

  function handleDownload(cert) {
    // Create a temporary container to render the SVG, then download as PNG
    const svgElement = document.querySelector(`[data-cert-id="${cert.certificateId}"]`);
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1120;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1600, 1120);
      const link = document.createElement("a");
      link.download = `${cert.certificateId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  if (loading) {
    return (
      <div className="page-wrap py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-wrap py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Award className="h-8 w-8 text-amber-500" />
          My Certificates
        </h1>
        <p className="mt-1 text-muted-foreground">
          Download and share your course completion certificates.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <Award className="h-16 w-16 text-muted-foreground/30" />
          <p className="text-lg font-semibold text-muted-foreground">No certificates yet</p>
          <p className="text-sm text-muted-foreground">
            Complete a course to earn your first certificate!
          </p>
          <Button onClick={() => navigate("/student-courses")}>Go to My Learning</Button>
        </div>
      ) : (
        <div className="space-y-10">
          {certificates.map((cert) => (
            <div key={cert.certificateId} className="space-y-3">
              <div data-cert-id={cert.certificateId}>
                <CertificateSVG cert={cert} />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => handleDownload(cert)}>
                  <Download className="mr-2 h-4 w-4" /> Download PNG
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/certificate-verify/${cert.certificateId}`)}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Verify Link
                </Button>
                <WhatsAppNotifyModal
                  type="certificate"
                  courseData={{
                    title: cert.courseTitle,
                    certificateId: cert.certificateId,
                    courseId: cert.courseId,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
