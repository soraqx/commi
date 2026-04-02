import { SignInButton, SignUpButton } from "@clerk/clerk-react";

/**
 * WelcomeScreen component - Displayed when user is logged out
 * Features decorative bubbles, logo, and authentication buttons
 */
export function WelcomeScreen() {
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
                        {/* Log In Button */}
                        <SignInButton mode="modal">
                            <button className="w-64 rounded-full bg-cyan-400 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2">
                                LOG IN
                            </button>
                        </SignInButton>

                        {/* Sign Up Button */}
                        <SignUpButton mode="modal">
                            <button className="w-64 rounded-full bg-cyan-400 px-8 py-3 font-bold text-gray-800 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2">
                                SIGN UP
                            </button>
                        </SignUpButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
