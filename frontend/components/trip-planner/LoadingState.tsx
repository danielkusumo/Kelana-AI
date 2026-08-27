"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Rocket, Sparkles, Globe, MapPin, Utensils, Hotel, Camera } from "lucide-react";

interface LoadingStateProps {
  onComplete?: () => void;
  dataReady?: boolean;
}

const loadingMessages = [
  "Analyzing destination data...",
  "Scanning local attractions...",
  "Calculating optimal budget allocation...",
  "Finding hidden gems and local secrets...",
  "Curating dining experiences...",
  "Matching activities to your travel style...",
  "Building your day-by-day timeline...",
  "Almost there... finalizing your itinerary!",
];

const processSteps = [
  { icon: Globe, label: "Destination Analysis" },
  { icon: MapPin, label: "Route Planning" },
  { icon: Utensils, label: "Dining & Cuisine" },
  { icon: Hotel, label: "Accommodations" },
  { icon: Camera, label: "Activities & Sights" },
];

export default function LoadingState({ onComplete, dataReady }: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const fireComplete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onCompleteRef.current?.();
  };

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3500);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const total = processSteps.length;
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setCurrentStep(i);
      if (i >= total) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(fireComplete, 700);
      }
    }, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Percepat ketika backend sudah mengirim data
  useEffect(() => {
    if (!dataReady) return;
    const timeoutId = setTimeout(() => {
      setCurrentStep(processSteps.length);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // jeda singkat agar semua checkmark, lalu selesaikan
      setTimeout(fireComplete, 600);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [dataReady]);

  const allDone = currentStep >= processSteps.length;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Multi-ring orbital system */}
      <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-violet-500/20"
        />
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-4 rounded-full border border-dotted border-fuchsia-500/20"
        />
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          className="absolute inset-8 rounded-full border border-amber-500/20"
        />

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: [6, 9, 4][i],
              ease: "linear",
            }}
            className="absolute inset-0"
          >
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full ${
                i === 0
                  ? "w-3 h-3 bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.6)]"
                  : i === 1
                  ? "w-2 h-2 bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.5)]"
                  : "w-2.5 h-2.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
              }`}
            />
          </motion.div>
        ))}

        {/* Center rocket */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <div className="p-4 rounded-full bg-gradient-to-br from-violet-500/20 to-amber-500/20 border border-white/10">
            <Rocket className="w-8 h-8 text-violet-300" />
          </div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-2xl md:text-3xl font-bold text-white mb-2 text-center"
      >
        Generating Your Journey
      </motion.h2>

      {/* Cycling message */}
      <div className="h-6 mb-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-amber-300/80 text-sm text-center flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loadingMessages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress steps */}
      <div className="w-full max-w-md space-y-3">
        {processSteps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const StepIcon = step.icon;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500
                ${
                  isCompleted
                    ? "bg-violet-500/10 border-violet-500/30"
                    : isActive
                    ? "bg-white/5 border-violet-400/40 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                    : "bg-white/[0.02] border-white/5"
                }
              `}
            >
              <div
                className={`
                  relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-500
                  ${
                    isCompleted
                      ? "bg-violet-500/20 text-violet-300"
                      : isActive
                      ? "bg-violet-500/10 text-violet-400"
                      : "bg-white/5 text-white/20"
                  }
                `}
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 rounded-lg bg-violet-400/20"
                  />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-500 ${
                  isCompleted
                    ? "text-violet-200"
                    : isActive
                    ? "text-white"
                    : "text-white/30"
                }`}
              >
                {step.label}
              </span>

              {isActive && (
                <motion.div
                  className="ml-auto flex gap-1"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: i * 0.15,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom tip / finalizing */}
      {allDone ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex items-center gap-2 text-violet-300/90 text-sm"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-4 h-4 border-2 border-violet-400/40 border-t-violet-300 rounded-full"
          />
          Finalizing your itinerary...
        </motion.div>
      ) : (
        <motion.p
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-white/30 text-xs mt-8 text-center max-w-sm"
        >
          This may take a moment as our AI analyzes thousands of data points to craft your perfect trip
        </motion.p>
      )}
    </div>
  );
}