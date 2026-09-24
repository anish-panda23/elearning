import { captureAndFinalizePaymentService } from "@/services";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, CreditCard, CheckCircle2 } from "lucide-react";
import WhatsAppNotifyModal from "@/components/common/WhatsAppNotifyModal";

/* ─── helpers ─────────────────────────────────────────── */
function formatCardNumber(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
function formatExpiry(v) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
}

/* ─── Card face component ─────────────────────────────── */
function CardFace({ cardNumber, cardHolder, expiry, flipped, cardType }) {
  const display = cardNumber.replace(/\s/g, "").padEnd(16, "•");
  const groups = [display.slice(0, 4), display.slice(4, 8), display.slice(8, 12), display.slice(12, 16)];

  const gradients = {
    visa: "from-blue-700 via-blue-500 to-cyan-400",
    mastercard: "from-red-700 via-orange-500 to-yellow-400",
    amex: "from-green-700 via-teal-500 to-cyan-400",
    default: "from-violet-700 via-purple-600 to-indigo-500",
  };
  const gradient = gradients[cardType] || gradients.default;

  return (
    <div className="card-flip-wrapper" style={{ perspective: "1000px" }}>
      <div
        className="card-flip-inner"
        style={{
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s cubic-bezier(.4,2,.6,1)",
          transformStyle: "preserve-3d",
          position: "relative",
          width: "340px",
          height: "200px",
        }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-2xl`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* chip */}
          <div className="mb-4 flex items-center justify-between">
            <div className="h-8 w-12 rounded bg-yellow-300/80 shadow-inner" />
            <span className="text-right text-xs font-semibold uppercase tracking-widest text-white/80">
              {cardType === "visa" ? "VISA" : cardType === "mastercard" ? "MASTERCARD" : cardType === "amex" ? "AMEX" : "CARD"}
            </span>
          </div>
          {/* number */}
          <div className="mt-2 flex gap-4 font-mono text-xl tracking-widest text-white drop-shadow">
            {groups.map((g, i) => <span key={i}>{g}</span>)}
          </div>
          {/* bottom row */}
          <div className="mt-4 flex justify-between">
            <div>
              <p className="text-[10px] uppercase text-white/60">Card Holder</p>
              <p className="text-sm font-semibold tracking-wide text-white">
                {cardHolder || "FULL NAME"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-white/60">Expires</p>
              <p className="text-sm font-semibold tracking-wide text-white">
                {expiry || "MM/YY"}
              </p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="mt-8 h-12 w-full bg-black/60" />
          <div className="mx-6 mt-4 flex items-center justify-end rounded bg-white/20 px-4 py-2">
            <p className="font-mono text-lg tracking-widest text-white">•••</p>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/50">CVV</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────── */
export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId") || JSON.parse(sessionStorage.getItem("currentOrderId") || "null");
  const courseTitle = params.get("courseTitle") || "Course";
  const coursePricing = parseFloat(params.get("coursePricing") || "0");
  const courseImage = params.get("courseImage") || "";

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const cvvRef = useRef(null);

  const cardType =
    /^4/.test(cardNumber.replace(/\s/g, "")) ? "visa" :
    /^5[1-5]/.test(cardNumber.replace(/\s/g, "")) ? "mastercard" :
    /^3[47]/.test(cardNumber.replace(/\s/g, "")) ? "amex" : "default";

  function validate() {
    const raw = cardNumber.replace(/\s/g, "");
    if (raw.length < 16) return "Enter a valid 16-digit card number.";
    if (!cardHolder.trim()) return "Enter the cardholder name.";
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Enter expiry as MM/YY.";
    if (cvv.length < 3) return "Enter a valid CVV.";
    return null;
  }

  async function handlePay(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setProcessing(true);
    try {
      const mockPaymentId = `mock_pay_${Date.now()}`;
      const mockPayerId = `mock_payer_${Math.random().toString(36).slice(2)}`;
      const response = await captureAndFinalizePaymentService(mockPaymentId, mockPayerId, orderId);
      if (response?.success) {
        setSuccess(true);
        sessionStorage.removeItem("currentOrderId");
        setTimeout(() => navigate("/student-courses", { replace: true }), 2000);
      } else {
        setError("Payment could not be completed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  /* auto-focus helpers */
  useEffect(() => {
    if (cardNumber.replace(/\s/g, "").length === 16) {
      document.getElementById("checkout-holder")?.focus();
    }
  }, [cardNumber]);

  if (success) {
    return (
      <div className="checkout-page">
        <div className="checkout-success-card">
          <CheckCircle2 size={64} className="checkout-success-icon" />
          <h2>Payment Successful!</h2>
          <p>You're enrolled in <strong>{courseTitle}</strong>.</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3">
            <WhatsAppNotifyModal
              type="enrollment"
              courseData={{ title: courseTitle, courseId: params.get("courseId") }}
            />
            <p className="checkout-redirect-note">Redirecting to your courses…</p>
          </div>
        </div>
        <style>{checkoutCSS}</style>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <style>{checkoutCSS}</style>

      <div className="checkout-container">
        {/* LEFT – card preview + form */}
        <div className="checkout-left">
          <h1 className="checkout-title">
            <Lock size={18} className="checkout-title-icon" /> Secure Checkout
          </h1>

          {/* animated card */}
          <div className="checkout-card-preview">
            <CardFace
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiry={expiry}
              flipped={flipped}
              cardType={cardType}
            />
          </div>

          <form onSubmit={handlePay} className="checkout-form" noValidate>
            {/* Card number */}
            <div className="checkout-field">
              <label htmlFor="checkout-cardnumber">Card Number</label>
              <div className="checkout-input-wrap">
                <CreditCard size={16} className="checkout-input-icon" />
                <input
                  id="checkout-cardnumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  autoComplete="cc-number"
                />
              </div>
            </div>

            {/* Cardholder */}
            <div className="checkout-field">
              <label htmlFor="checkout-holder">Cardholder Name</label>
              <input
                id="checkout-holder"
                type="text"
                placeholder="John Doe"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                autoComplete="cc-name"
              />
            </div>

            {/* Expiry + CVV */}
            <div className="checkout-row">
              <div className="checkout-field">
                <label htmlFor="checkout-expiry">Expiry</label>
                <input
                  id="checkout-expiry"
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  autoComplete="cc-exp"
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="checkout-cvv">CVV</label>
                <input
                  id="checkout-cvv"
                  ref={cvvRef}
                  type="password"
                  inputMode="numeric"
                  placeholder="•••"
                  maxLength={4}
                  value={cvv}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setFlipped(false)}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  autoComplete="cc-csc"
                />
              </div>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button
              type="submit"
              className="checkout-pay-btn"
              disabled={processing}
            >
              {processing ? (
                <span className="checkout-spinner" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Pay ${coursePricing.toFixed(2)}
                </>
              )}
            </button>

            <p className="checkout-secure-note">
              <Lock size={12} /> Your payment info is encrypted and never stored.
            </p>
          </form>
        </div>

        {/* RIGHT – order summary */}
        <div className="checkout-right">
          <h2 className="checkout-summary-title">Order Summary</h2>
          {courseImage && (
            <img
              src={courseImage}
              alt={courseTitle}
              className="checkout-course-image"
            />
          )}
          <p className="checkout-course-name">{courseTitle}</p>
          <div className="checkout-summary-row">
            <span>Course price</span>
            <span>${coursePricing.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-row checkout-summary-row--total">
            <span>Total</span>
            <span>${coursePricing.toFixed(2)}</span>
          </div>
          <div className="checkout-badges">
            <span>✓ Lifetime Access</span>
            <span>✓ Certificate</span>
            <span>✓ 30-day Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Scoped CSS ──────────────────────────────────────── */
const checkoutCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .checkout-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    font-family: 'Inter', sans-serif;
  }

  .checkout-container {
    display: flex;
    gap: 2rem;
    max-width: 900px;
    width: 100%;
    flex-wrap: wrap;
  }

  /* LEFT */
  .checkout-left {
    flex: 1;
    min-width: 320px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 1.5rem;
    padding: 2rem;
    backdrop-filter: blur(16px);
    box-shadow: 0 24px 64px rgba(0,0,0,0.4);
  }

  .checkout-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1.5rem;
    letter-spacing: 0.02em;
  }
  .checkout-title-icon { color: #a78bfa; }

  .checkout-card-preview {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  /* Form */
  .checkout-form { display: flex; flex-direction: column; gap: 1rem; }

  .checkout-field { display: flex; flex-direction: column; gap: 4px; }

  .checkout-field label {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .checkout-field input,
  .checkout-input-wrap input {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 0.75rem;
    padding: 0.7rem 1rem;
    color: #fff;
    font-size: 0.95rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .checkout-field input:focus,
  .checkout-input-wrap input:focus {
    border-color: #a78bfa;
    box-shadow: 0 0 0 3px rgba(167,139,250,0.2);
  }
  .checkout-field input::placeholder,
  .checkout-input-wrap input::placeholder { color: rgba(255,255,255,0.25); }

  .checkout-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .checkout-input-icon {
    position: absolute;
    left: 12px;
    color: rgba(255,255,255,0.35);
    pointer-events: none;
  }
  .checkout-input-wrap input { padding-left: 2.2rem; }

  .checkout-row { display: flex; gap: 1rem; }
  .checkout-row .checkout-field { flex: 1; }

  .checkout-error {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.4);
    border-radius: 0.5rem;
    color: #fca5a5;
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
    margin: 0;
  }

  .checkout-pay-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
    border: none;
    border-radius: 0.875rem;
    padding: 0.875rem;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(124,58,237,0.5);
    letter-spacing: 0.03em;
    margin-top: 0.5rem;
  }
  .checkout-pay-btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(124,58,237,0.6);
  }
  .checkout-pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .checkout-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .checkout-secure-note {
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: center;
    font-size: 0.72rem;
    color: rgba(255,255,255,0.35);
    margin: 0;
  }

  /* RIGHT */
  .checkout-right {
    width: 260px;
    min-width: 220px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1.5rem;
    padding: 1.75rem;
    backdrop-filter: blur(16px);
    box-shadow: 0 24px 64px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-self: flex-start;
  }

  .checkout-summary-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(255,255,255,0.55);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0;
  }

  .checkout-course-image {
    width: 100%;
    border-radius: 0.75rem;
    aspect-ratio: 16/9;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .checkout-course-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
    line-height: 1.4;
  }

  .checkout-summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.55);
    border-top: 1px solid rgba(255,255,255,0.07);
    padding-top: 0.75rem;
  }
  .checkout-summary-row--total {
    font-weight: 700;
    font-size: 1.05rem;
    color: #a78bfa;
  }

  .checkout-badges {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .checkout-badges span {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.45);
  }

  /* Success */
  .checkout-success-card {
    text-align: center;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 1.5rem;
    padding: 3rem 2.5rem;
    color: #fff;
    backdrop-filter: blur(16px);
    animation: fadeUp 0.5s ease;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }

  .checkout-success-icon { color: #34d399; margin-bottom: 1rem; }

  .checkout-success-card h2 {
    font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem;
  }
  .checkout-success-card p { color: rgba(255,255,255,0.65); margin: 0.25rem 0; }
  .checkout-redirect-note { font-size: 0.8rem; margin-top: 1rem !important; color: rgba(255,255,255,0.35) !important; }

  @media (max-width: 680px) {
    .checkout-container { flex-direction: column; }
    .checkout-right { width: 100%; }
  }
`;
