"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TripRequest, TripResponse } from "@/types/trip";
import { generateTrip } from "@/lib/api";
import StarField from "@/components/trip-planner/StarField";
import TripForm from "@/components/trip-planner/TripForm";
import LoadingState from "@/components/trip-planner/LoadingState";
import ItineraryResult from "@/components/trip-planner/ItineraryResult";

type ViewState = "form" | "loading" | "result";

export default function Home() {
  const [view, setView] = useState<ViewState>("form");
  const [tripResult, setTripResult] = useState<TripResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);

  const handleSubmit = async (data: TripRequest) => {
    setError(null);
    setDataReady(false);
    setLoadingDone(false);
    setView("loading");
    try {
      const result = await generateTrip(data);
      setTripResult(result);
      setDataReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setView("form");
    }
  };

  const handleLoadingComplete = useCallback(() => {
    setLoadingDone(true);
  }, []);

  const handleReset = () => {
    setTripResult(null);
    setError(null);
    setDataReady(false);
    setLoadingDone(false);
    setView("form");
  };

  // Only reveal results once BOTH the data has arrived AND the loading steps finished
  useEffect(() => {
    if (view === "loading" && dataReady && loadingDone) {
      setView("result");
    }
  }, [view, dataReady, loadingDone]);

  return (
    <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
      <StarField />

      {/* Nebula background effects */}
      <div className="nebula-1" />
      <div className="nebula-2" />

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
              <LoadingState onComplete={handleLoadingComplete} dataReady={dataReady} />
            </motion.div>
          )}

          {view === "result" && tripResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <ItineraryResult trip={tripResult} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}