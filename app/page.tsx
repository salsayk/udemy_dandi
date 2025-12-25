"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function HomeContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const isLoading = status === "loading";

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboards" });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="m2 17 10 5 10-5"/>
              <path d="m2 12 10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            dandi
          </h1>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            {message}
          </div>
        )}

        {/* Main Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-500">Loading...</p>
            </div>
          ) : session ? (
            // Logged in state
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 overflow-hidden">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {session.user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-slate-900 mb-1">
                Welcome back!
              </h2>
              <p className="text-slate-500 mb-6 text-sm">
                {session.user?.name || session.user?.email}
              </p>

              <div className="space-y-3">
                <Link
                  href="/dashboards"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Go to Dashboard
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" x2="9" y1="12" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            // Logged out state
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome to Dandi
              </h2>
              <p className="text-slate-500 mb-8">
                Sign in to manage your API keys and access AI-powered tools
              </p>

              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  By signing in, you agree to our{" "}
                  <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        {!session && !isLoading && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">API Keys</h3>
              <p className="text-sm text-slate-500">Manage and monitor your API keys</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">AI Tools</h3>
              <p className="text-sm text-slate-500">Access powerful AI-powered APIs</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Secure</h3>
              <p className="text-sm text-slate-500">Enterprise-grade security</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
