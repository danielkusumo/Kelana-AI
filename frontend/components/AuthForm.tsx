"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Sparkles, Mail, Lock, User, Rocket, ChevronLeft } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import {
  loginUser,
  registerUser,
  saveSession,
} from "@/services/authService";

interface AuthFormProps {
  mode: "login" | "register";
}

function AuthFormInner({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const inputClasses = `
    w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12
    text-white placeholder-white/30
    focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20
    transition-all duration-300
  `;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = isRegister
        ? await registerUser({ name, email, password })
        : await loginUser({ email, password });
      saveSession(result);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">

      <GlassCard className="w-full p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>{isRegister ? "Create your account" : "Welcome back"}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isRegister ? "Join KelanaAI" : "Sign in to KelanaAI"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {isRegister
              ? "Start planning your next adventure with AI"
              : "Continue your journey"}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  focusedField === "name" ? "text-amber-400" : "text-white/30"
                }`}
              />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={inputClasses}
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === "email" ? "text-amber-400" : "text-white/30"
              }`}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative">
            <Lock
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === "password" ? "text-amber-400" : "text-white/30"
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className={inputClasses}
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full relative overflow-hidden rounded-xl py-4 px-6
              font-semibold text-white text-base tracking-wide
              bg-gradient-to-r from-violet-700/80 via-violet-600/90 to-fuchsia-700/80
              hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600
              transition-all duration-500
              shadow-[0_0_20px_rgba(139,92,246,0.2)]
              hover:shadow-[0_0_35px_rgba(139,92,246,0.35)]
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
              group
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Rocket className="w-4 h-4" />
                  </motion.div>
                  {isRegister ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  {isRegister ? "Create Account" : "Sign In"}
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-sm">
          {isRegister ? (
            <p className="text-white/50">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-300 hover:text-violet-200 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          ) : (
            <p className="text-white/50">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-violet-300 hover:text-violet-200 font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  return (
    <Suspense fallback={null}>
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}