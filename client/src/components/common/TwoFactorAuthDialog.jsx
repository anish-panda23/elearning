import { useState, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function TwoFactorAuthDialog() {
  const { auth, setup2FA, verify2FA, disable2FA } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState("initial"); // 'initial' | 'setup' | 'enabled'
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const handleStartSetup = async () => {
    setStatusMessage({ type: "", text: "" });
    const res = await setup2FA();
    if (res.success) {
      setQrCodeUrl(res.data.qrCodeUrl);
      setSecret(res.data.secret);
      setStep("setup");
    } else {
      setStatusMessage({ type: "error", text: "Failed to generate 2FA secret." });
    }
  };

  const handleVerifyAndEnable = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });
    const res = await verify2FA(totpCode);
    if (res.success) {
      setStep("enabled");
      setStatusMessage({ type: "success", text: "Google Authenticator 2FA enabled!" });
    } else {
      setStatusMessage({ type: "error", text: res.message || "Invalid 6-digit code." });
    }
  };

  const handleDisable = async () => {
    setStatusMessage({ type: "", text: "" });
    const res = await disable2FA();
    if (res.success) {
      setStep("initial");
      setQrCodeUrl("");
      setSecret("");
      setStatusMessage({ type: "success", text: "2FA has been disabled." });
    } else {
      setStatusMessage({ type: "error", text: "Failed to disable 2FA." });
    }
  };

  const isEnabled = auth?.user?.isTwoFactorEnabled;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          {isEnabled ? "2FA Enabled" : "Enable 2FA"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Google Authenticator (2FA)
          </DialogTitle>
          <DialogDescription>
            Enhance account security with Two-Factor Authentication using Google Authenticator.
          </DialogDescription>
        </DialogHeader>

        {statusMessage.text && (
          <div
            className={`p-3 rounded-md text-sm font-medium text-center ${
              statusMessage.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {isEnabled || step === "enabled" ? (
          <div className="space-y-4 text-center py-2">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <div>
              <p className="font-semibold text-slate-800">Two-Factor Authentication is Active</p>
              <p className="text-xs text-slate-500 mt-1">
                Your account is secured with Google Authenticator.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDisable} className="w-full">
              Disable 2FA
            </Button>
          </div>
        ) : step === "setup" ? (
          <form onSubmit={handleVerifyAndEnable} className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-slate-600 text-center">
                Scan this QR code with your <strong>Google Authenticator app</strong>:
              </p>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="Google Authenticator QR Code" className="w-44 h-44 border p-1 rounded-lg" />
              )}
              <p className="text-xs text-slate-400 font-mono select-all">Secret: {secret}</p>
            </div>

            <div>
              <Label htmlFor="totp">Enter 6-Digit Verification Code</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="totp"
                  type="text"
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="pl-9 text-center font-mono text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("initial")} className="w-1/2">
                Back
              </Button>
              <Button type="submit" className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white">
                Verify & Activate
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-900">
              <p className="font-medium">Why enable 2FA?</p>
              <p className="text-xs mt-1 text-indigo-700">
                When logging in, you will be prompted for a 6-digit code generated by the Google Authenticator app on your phone.
              </p>
            </div>
            <Button onClick={handleStartSetup} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Setup Google Authenticator
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
