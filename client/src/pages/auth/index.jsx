import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { GraduationCap, ShieldCheck, Lock } from "lucide-react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [totpCode, setTotpCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignUpSubmit = async (event) => {
    if (event && event.preventDefault) event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const res = await handleRegisterUser(event);
    if (res?.success) {
      setSignInFormData({
        userEmail: signUpFormData.userEmail,
        password: signUpFormData.password,
      });
      setSuccessMessage("Registration successful! Please click 'Sign In' below.");
      setActiveTab("signin");
    } else {
      setErrorMessage(res?.message || "Registration failed. Please try again.");
    }
  };
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
    handleGoogleLogin,
    handle2FAValidation,
    pending2FA,
    setPending2FA,
  } = useContext(AuthContext);

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== ""
    );
  }

  const onGoogleSuccess = async (credentialResponse) => {
    setErrorMessage("");
    const res = await handleGoogleLogin(credentialResponse.credential);
    if (res && !res.success) {
      setErrorMessage(res.message || "Google authentication failed");
    }
  };

  const onGoogleError = () => {
    setErrorMessage("Google Sign-In failed or was cancelled.");
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const res = await handle2FAValidation(totpCode);
    if (res && !res.success) {
      setErrorMessage(res.message || "Invalid 2FA code");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <GraduationCap className="h-6 w-6" />
          Elearn Adda
        </Link>
        <div className="relative z-10 my-auto max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight">
            A learning platform built like a product, not a demo.
          </h1>
          <p className="mt-4 text-slate-300">
            Instructors publish courses. Students search, enroll, watch, and
            track progress — with notes that stay with each lecture.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-200">
            <li>• Role-based student and instructor workspaces</li>
            <li>• Google OAuth 2.0 & Google Authenticator 2FA support</li>
            <li>• Checkout, progress, and completion flows</li>
          </ul>
        </div>
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center border-b px-6 lg:hidden">
          <Link to="/" className="font-extrabold">
            Elearn Adda
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center p-6">
          {pending2FA?.isPending ? (
            <Card className="w-full max-w-md border-indigo-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Enter the 6-digit code from your Google Authenticator app.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handle2FASubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="totpCode">Google Authenticator Code</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="totpCode"
                        type="text"
                        placeholder="123456"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        className="pl-9 text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="text-center text-sm font-medium text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    Verify Code
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setPending2FA({ isPending: false, userId: null })}
                  >
                    Cancel
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Tabs
              value={activeTab}
              defaultValue="signin"
              onValueChange={setActiveTab}
              className="w-full max-w-md"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Sign in to continue learning or manage your courses.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center my-2">
                      <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={onGoogleError}
                        useOneTap
                      />
                    </div>
                    <div className="relative flex items-center justify-center text-xs uppercase text-slate-400">
                      <span className="bg-background px-2 z-10">Or continue with</span>
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                    </div>

                    {successMessage && (
                      <div className="rounded-lg bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                        {successMessage}
                      </div>
                    )}
                    {errorMessage && (
                      <div className="text-center text-sm font-medium text-red-600">
                        {errorMessage}
                      </div>
                    )}

                    <CommonForm
                      formControls={signInFormControls}
                      buttonText={"Sign In"}
                      formData={signInFormData}
                      setFormData={setSignInFormData}
                      isButtonDisabled={!checkIfSignInFormIsValid()}
                      handleSubmit={handleLoginUser}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="signup">
                <Card className="border-0 shadow-none">
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Start as a student or instructor in one flow.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center my-2">
                      <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={onGoogleError}
                      />
                    </div>
                    <div className="relative flex items-center justify-center text-xs uppercase text-slate-400">
                      <span className="bg-background px-2 z-10">Or continue with</span>
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="text-center text-sm font-medium text-red-600">
                        {errorMessage}
                      </div>
                    )}

                    <CommonForm
                      formControls={signUpFormControls}
                      buttonText={"Sign Up"}
                      formData={signUpFormData}
                      setFormData={setSignUpFormData}
                      isButtonDisabled={!checkIfSignUpFormIsValid()}
                      handleSubmit={handleSignUpSubmit}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

