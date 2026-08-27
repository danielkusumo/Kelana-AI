"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TripRequest } from "@/types/trip";
import { generateTrip } from "@/services/tripService";
import StarField from "@/components/trip-planner/StarField";
import TripForm from "@/components/trip-planner/TripForm";
import LoadingState from "@/components/trip-planner/LoadingState";

import Link from "next/link";
import { Compass } from "lucide-react";

type ViewState = "form" | "loading";

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>("form");
  const [error, setError] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);

  const dataReadyRef = useRef(false);
  const loadingDoneRef = useRef(false);

  const tryRedirect = useCallback(() => {
    if (dataReadyRef.current && loadingDoneRef.current) {
      router.push("/trips");
    }
  }, [router]);

  const handleSubmit = async (data: TripRequest) => {
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

  return (
    <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
      <StarField />

      {/* Nebula background effects */}
      <div className="nebula-1" />
      <div className="nebula-2" />

      {/* Top-right nav */}
      <div className="relative z-20 flex justify-end px-6 pt-6">
        <Link
          href="/trips"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm"
        >
          <Compass className="w-4 h-4" />
          My Trips
        </Link>
      </div>

      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-4 py-8">
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
      </div>
    </main>
  );
}