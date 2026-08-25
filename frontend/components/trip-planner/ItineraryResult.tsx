"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  CalendarDays,
  Compass,
  ArrowLeft,
  Sparkles,
  Tag,
} from "lucide-react";
import { TripResponse } from "@/types/trip";
import GlassCard from "@/components/ui/GlassCard";
import ItineraryContent from "./ItineraryContent";
import { getDestinationImage } from "@/lib/destination";

interface ItineraryResultProps {
  trip: TripResponse;
  onReset: () => void;
}

export default function ItineraryResult({ trip, onReset }: ItineraryResultProps) {
  const heroImage = getDestinationImage(trip.destination);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero destination image */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-40 sm:h-48 md:h-56 rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={trip.destination}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-400/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-violet-200" />
            </div>
            <span className="text-violet-200 text-xs font-medium tracking-wide uppercase">
              AI-Generated Itinerary
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {trip.destination}
          </h1>
        </div>
      </motion.div>

      {/* Header Card */}
      <GlassCard className="p-6 md:p-8 -mt-8 sm:-mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBadge
              icon={<CalendarDays className="w-4 h-4" />}
              label="Duration"
              value={`${trip.days} Days`}
            />
            <InfoBadge
              icon={<Wallet className="w-4 h-4" />}
              label="Budget"
              value={`$${trip.budget.toLocaleString()}`}
            />
            <InfoBadge
              icon={<Compass className="w-4 h-4" />}
              label="Style"
              value={trip.travel_style}
            />
            <InfoBadge
              icon={<Tag className="w-4 h-4" />}
              label="Category"
              value={trip.category}
            />
          </div>
        </motion.div>
      </GlassCard>

      {/* Itinerary Content (parsed from backend markdown) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {trip.ai_recommendation ? (
          <ItineraryContent markdown={trip.ai_recommendation} />
        ) : (
          <GlassCard className="p-8 text-center">
            <p className="text-white/50">
              No itinerary was generated. Please try again.
            </p>
          </GlassCard>
        )}
      </motion.div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center pb-10"
      >
        <button
          onClick={onReset}
          className="
            group flex items-center gap-2 px-8 py-3 rounded-xl
            bg-white/5 border border-white/10
            text-white/70 hover:text-white
            hover:bg-white/10 hover:border-white/20
            transition-all duration-300
            hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]
          "
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Plan Another Trip
        </button>
      </motion.div>
    </div>
  );
}

function InfoBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-white font-semibold">{value}</div>
    </div>
  );
}