import { useSignIn, useSignUp, useClerk } from "@clerk/clerk-react";
import { useState } from "react";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { Capacitor } from "@capacitor/core";

type AuthView = "welcome" | "signin" | "signup";

function SignInForm({ onBack }: { onBack: () => void }) {
    const { signIn, isLoaded: signInLoaded } = useSignIn();
    const { setActive } = useClerk();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signInLoaded || loading) return;

        setError("");
        setLoading(true);

        try {
            await signIn.create({
                identifier: email,
                strategy: "email_code",
            });
            setPendingVerification(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Failed to send code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signInLoaded || isVerifying) return;

        setError("");
        setIsVerifying(true);
        console.log("AUTH TRACE: 1. Starting Verification");

        try {
            if (!signInLoaded) return;

            console.log("AUTH TRACE: 2. Sending Code to Clerk");
            const result = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code,
            });

            console.log("AUTH TRACE: 3. Clerk Response Received", result.status);

            if (result.status === "complete") {
                console.log("AUTH TRACE: 4. Setting Active Session");
                await setActive({ session: result.createdSessionId });

                console.log("AUTH TRACE: 5. Session Active! Clerk will auto-render SignedIn view...");
            } else {
                console.error("AUTH TRACE: Missing Requirements", result);
                setError("Verification failed. Please try again.");
            }
        } catch (err: any) {
            console.error("AUTH TRACE: ❌ Caught Error:", JSON.stringify(err.errors, null, 2));
            setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid code. Please try again.");
        } finally {
            console.log("AUTH TRACE: 6. Finally block reached. Unlocking button.");
            setIsVerifying(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!signInLoaded) return;
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/"
            });
        } catch (err) {
            console.error("Google login error:", err);
        }
    };

    return (
        <div className="w-full max-w-md space-y-5">
            <button
                type="button"
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-1 text-gray-500">
                    {pendingVerification ? "Enter the code sent to your email" : "Sign in to your account"}
                </p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {!Capacitor.isNativePlatform() && !pendingVerification && (
                <>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full rounded-full bg-white border border-gray-300 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <LogIn className="h-5 w-5" />
                            Sign in with Google
                        </span>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">or continue with email</span>
                        </div>
                    </div>
                </>
            )}

            {!pendingVerification ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                        <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="signin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            placeholder="you@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-cyan-400 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Sending code...
                            </span>
                        ) : (
                            "SEND CODE"
                        )}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                        <label htmlFor="signin-code" className="block text-sm font-medium text-gray-700">
                            Verification Code
                        </label>
                        <input
                            id="signin-code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            maxLength={6}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            placeholder="123456"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="w-full rounded-full bg-cyan-400 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isVerifying ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Verifying...
                            </span>
                        ) : (
                            "VERIFY & SIGN IN"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setPendingVerification(false);
                            setCode("");
                            setError("");
                        }}
                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                    >
                        Didn't receive a code? Send again
                    </button>
                </form>
            )}
        </div>
    );
}

function SignUpForm({ onBack }: { onBack: () => void }) {
    const { signUp, isLoaded: signUpLoaded } = useSignUp();
    const { setActive } = useClerk();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signUpLoaded || loading) return;

        setError("");
        setLoading(true);

        try {
            await signUp.create({
                emailAddress: email,
            });
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });
            setPendingVerification(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Failed to send code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signUpLoaded || isVerifying) return;

        setError("");
        setIsVerifying(true);
        console.log("AUTH TRACE: 1. Starting Verification");

        try {
            if (!signUpLoaded) return;

            console.log("AUTH TRACE: 2. Sending Code to Clerk");
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            console.log("AUTH TRACE: 3. Clerk Response Received", completeSignUp.status);

            if (completeSignUp.status === "complete") {
                console.log("AUTH TRACE: 4. Setting Active Session");
                await setActive({ session: completeSignUp.createdSessionId });

                console.log("AUTH TRACE: 5. Session Active! Clerk will auto-render SignedIn view...");
            } else {
                console.error("AUTH TRACE: Missing Requirements", completeSignUp);
                setError("Verification failed. Please try again.");
            }
        } catch (err: any) {
            console.error("AUTH TRACE: ❌ Caught Error:", JSON.stringify(err.errors, null, 2));
            setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid code. Please try again.");
        } finally {
            console.log("AUTH TRACE: 6. Finally block reached. Unlocking button.");
            setIsVerifying(false);
        }
    };

    const handleGoogleSignUp = async () => {
        if (!signUpLoaded) return;
        try {
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/"
            });
        } catch (err) {
            console.error("Google signup error:", err);
        }
    };

    return (
        <div className="w-full max-w-md space-y-5">
            <button
                type="button"
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="mt-1 text-gray-500">
                    {pendingVerification ? "Enter the code sent to your email" : "Join Chatcommiot"}
                </p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {!Capacitor.isNativePlatform() && !pendingVerification && (
                <>
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="w-full rounded-full bg-white border border-gray-300 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <LogIn className="h-5 w-5" />
                            Sign up with Google
                        </span>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">or continue with email</span>
                        </div>
                    </div>
                </>
            )}

            {!pendingVerification ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                        <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            placeholder="you@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-cyan-400 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Sending code...
                            </span>
                        ) : (
                            "SEND CODE"
                        )}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                        <label htmlFor="signup-code" className="block text-sm font-medium text-gray-700">
                            Verification Code
                        </label>
                        <input
                            id="signup-code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            maxLength={6}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            placeholder="123456"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifying}
                        className="w-full rounded-full bg-cyan-400 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isVerifying ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Verifying...
                            </span>
                        ) : (
                            "VERIFY & CREATE ACCOUNT"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setPendingVerification(false);
                            setCode("");
                            setError("");
                        }}
                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                    >
                        Didn't receive a code? Send again
                    </button>
                </form>
            )}
        </div>
    );
}

/**
 * WelcomeScreen component - Displayed when user is logged out
 * Features decorative bubbles, logo, and authentication buttons
 */
export function WelcomeScreen() {
    const [authView, setAuthView] = useState<AuthView>("welcome");

    if (authView === "signin") {
        return (
            <div className="relative min-h-screen w-full overflow-hidden bg-white">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-200 opacity-50" />
                <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-blue-100 opacity-60" />
                <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-200 opacity-50" />
                <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-blue-100 opacity-60" />

                <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
                    <SignInForm onBack={() => setAuthView("welcome")} />
                </div>
            </div>
        );
    }

    if (authView === "signup") {
        return (
            <div className="relative min-h-screen w-full overflow-hidden bg-white">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-200 opacity-50" />
                <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-blue-100 opacity-60" />
                <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-200 opacity-50" />
                <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-blue-100 opacity-60" />

                <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
                    <SignUpForm onBack={() => setAuthView("welcome")} />
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white">
            {/* Decorative Top-Left Bubbles */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-200 opacity-50" />
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-blue-100 opacity-60" />

            {/* Decorative Bottom-Right Bubbles */}
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-200 opacity-50" />
            <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-blue-100 opacity-60" />

            {/* Content Container */}
            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
                <div className="flex flex-col items-center gap-8">
                    {/* Logo */}
                    <img
                        src="/chatcommiot-logo.png"
                        alt="Chatcommiot"
                        className="h-auto w-64 drop-shadow-md"
                    />

                    {/* Welcome Text */}
                    <div className="text-center">
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">
                            Welcome to Chatcommiot
                        </h1>
                        <p className="text-lg text-gray-600">
                            Passenger and Vehicle Tracker
                        </p>
                    </div>

                    {/* Description */}
                    <p className="max-w-md text-center text-gray-500">
                        Real-time fleet monitoring and passenger tracking for seamless transportation
                        operations. Sign in or create an account to get started.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setAuthView("signin")}
                            className="w-64 rounded-full bg-cyan-400 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
                        >
                            LOG IN
                        </button>

                        <button
                            onClick={() => setAuthView("signup")}
                            className="w-64 rounded-full bg-cyan-400 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
                        >
                            SIGN UP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
