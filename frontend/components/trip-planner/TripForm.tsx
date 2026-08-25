"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Wallet,
  CalendarDays,
  Compass,
  Sparkles,
  Rocket,
} from "lucide-react";
import { TripRequest } from "@/types/trip";
import GlassCard from "@/components/ui/GlassCard";

interface TripFormProps {
  onSubmit: (data: TripRequest) => void;
  isLoading: boolean;
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !budget || !days) return;
    onSubmit({
      destination,
      budget: Number(budget),
      days: Number(days),
      travel_style: travelStyle || "Standard",
    });
  };

  const inputClasses = `
    w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12
    text-white placeholder-white/30
    focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20
    transition-all duration-300
  `;

  return (
    <GlassCard className="w-full max-w-lg mx-auto p-6 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Trip Planner</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Plan Your Next Adventure
        </h1>
        <p className="text-white/50 text-sm">
          Tell us your dream destination and let our AI craft the perfect itinerary
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <MapPin
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              focusedField === "destination" ? "text-amber-400" : "text-white/30"
            }`}
          />
          <input
            type="text"
            placeholder="Where do you want to go?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setFocusedField("destination")}
            onBlur={() => setFocusedField(null)}
            className={inputClasses}
            required
          />
        </motion.div>

        {/* Budget & Days Row */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="relative">
            <Wallet
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === "budget" ? "text-amber-400" : "text-white/30"
              }`}
            />
            <input
              type="number"
              placeholder="Budget ($)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onFocus={() => setFocusedField("budget")}
              onBlur={() => setFocusedField(null)}
              className={inputClasses}
              min="1"
              required
            />
          </div>
          <div className="relative">
            <CalendarDays
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === "days" ? "text-amber-400" : "text-white/30"
              }`}
            />
            <input
              type="number"
              placeholder="Days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              onFocus={() => setFocusedField("days")}
              onBlur={() => setFocusedField(null)}
              className={inputClasses}
              min="1"
              max="30"
              required
            />
          </div>
        </motion.div>

        {/* Travel Style — free text input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <Compass
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              focusedField === "travelStyle" ? "text-amber-400" : "text-white/30"
            }`}
          />
          <input
            type="text"
            placeholder="Travel style (e.g. Fun, Business, Family)"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
            onFocus={() => setFocusedField("travelStyle")}
            onBlur={() => setFocusedField(null)}
            className={inputClasses}
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full relative overflow-hidden rounded-xl py-4 px-6
              font-semibold text-white text-lg tracking-wide
              bg-gradient-to-r from-violet-700/80 via-violet-600/90 to-fuchsia-700/80
              hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600
              transition-all duration-500
              shadow-[0_0_20px_rgba(139,92,246,0.2)]
              hover:shadow-[0_0_35px_rgba(139,92,246,0.35)]
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-3
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
                    <Rocket className="w-5 h-5" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  Generate Trip
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </motion.div>
      </form>
    </GlassCard>
  );
}