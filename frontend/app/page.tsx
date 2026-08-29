"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TripRequest } from "@/types/trip";
import { generateTrip } from "@/services/tripService";
import {
  isAuthenticated,
  toAuthUrl,
  getCurrentUser,
} from "@/services/authService";
import StarField from "@/components/trip-planner/StarField";
import TripForm from "@/components/trip-planner/TripForm";
import LoadingState from "@/components/trip-planner/LoadingState";

import Link from "next/link";
import {
  Compass,
  Sparkles,
  LogOut,
  User,
  Loader2,
} from "lucide-react";
import { clearSession } from "@/services/authService";
import ConfirmModal from "@/components/ConfirmModal";

type ViewState = "form" | "loading";
type AuthState = "checking" | "authed";

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>("form");
  const [error, setError] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);

  const [authState, setAuthState] = useState<AuthState>("checking");
  const [userName, setUserName] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const dataReadyRef = useRef(false);
  const loadingDoneRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      // Require login — redirect straight to /login
      router.replace(toAuthUrl("/"));
      return;
    }
    getCurrentUser()
      .then((user) => {
        setUserName(user?.name ?? null);
        setAuthState("authed");
      })
      .catch(() => {
        setAuthState("authed");
      });
  }, [router]);

  const tryRedirect = useCallback(() => {
    if (dataReadyRef.current && loadingDoneRef.current) {
      router.push("/trips");
    }
  }, [router]);

  const handleSubmit = async (data: TripRequest) => {
    if (!isAuthenticated()) {
      router.push(toAuthUrl("/"));
      return;
    }
    setError(null);
    setDataReady(false);
    dataReadyRef.current = false;
    loadingDoneRef.current = false;
    setView("loading");
    try {
      await generateTrip(data);
      setDataReady(true);
      dataReadyRef.current = true;
      tryRedirect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setView("form");
    }
  };

  const handleLoadingComplete = useCallback(() => {
    loadingDoneRef.current = true;
    tryRedirect();
  }, [tryRedirect]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    clearSession();
    router.replace("/login");
  };

  const navAuthed = (
    <div className="flex items-center gap-2">
      <Link
        href="/profile"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-200 text-sm hover:bg-violet-500/20 transition-all"
      >
        <User className="w-4 h-4" />
        {userName || "Profile"}
      </Link>
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
      <Link
        href="/trips"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm"
      >
        <Compass className="w-4 h-4" />
        My Trips
      </Link>
    </div>
  );

  const content =
    authState === "checking" ? (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-white/50 text-sm">Checking session...</p>
      </div>
    ) : (
      <AnimatePresence mode="wait">
        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <TripForm onSubmit={handleSubmit} isLoading={false} />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4 max-w-lg mx-auto"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        )}

        {view === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <LoadingState
              onComplete={handleLoadingComplete}
              dataReady={dataReady}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );

  return (
    <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
      <StarField />

      {/* Nebula background effects */}
      <div className="nebula-1" />
      <div className="nebula-2" />

      {/* Top-right nav */}
      <div className="relative z-20 flex justify-end px-6 pt-6">
        {authState === "authed" ? (
          navAuthed
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-sm">
              <Sparkles className="w-4 h-4" />
              KelanaAI
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-4 py-8">
        {content}
      </div>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Log out of KelanaAI?"
        description="You will need to sign in again to access your trips."
        confirmLabel="Log out"
        cancelLabel="Cancel"
        danger
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </main>
  );
}