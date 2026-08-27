"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Wallet, Compass, Tag, Loader2, Sparkles } from "lucide-react";
import { TripResponse } from "@/types/trip";
import { getTrip } from "@/services/tripService";
import { getDestinationImage } from "@/lib/destination";
import GlassCard from "@/components/ui/GlassCard";
import ItineraryContent from "@/components/trip-planner/ItineraryContent";

export default function TripDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInvalid = !id || isNaN(id);

  useEffect(() => {
    if (isInvalid) return;
    getTrip(id)
      .then(setTrip)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load trip"))
      .finally(() => setLoading(false));
  }, [id, isInvalid]);

  if (isInvalid) {
    return (
      <main className="cosmic-bg relative flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-6 px-6 max-w-md">
          <p className="font-medium mb-4">Invalid trip ID</p>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to trips
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="cosmic-bg relative flex-1 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
        <p className="text-white/50 text-sm">Loading trip...</p>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="cosmic-bg relative flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-6 px-6 max-w-md">
          <p className="font-medium mb-4">{error || "Trip not found"}</p>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to trips
          </Link>
        </div>
      </main>
    );
  }

  const heroImage = getDestinationImage(trip.destination);

  return (
    <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
      <div className="nebula-1" />
      <div className="nebula-2" />

      <div className="relative z-10 flex flex-col flex-1 px-4 py-8">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
            >
              <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/25">
                <Sparkles className="w-5 h-5 text-violet-300" />
              </div>
              <span className="text-lg font-bold tracking-tight">KelanaAI</span>
            </Link>
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              All trips
            </Link>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          >
            <img
              src={heroImage}
              alt={trip.destination}
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover"
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

          {/* Info Card */}
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

          {/* Itinerary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {trip.ai_recommendation ? (
              <ItineraryContent markdown={trip.ai_recommendation} />
            ) : (
              <GlassCard className="p-8 text-center">
                <p className="text-white/50">No itinerary was generated. Please try again.</p>
              </GlassCard>
            )}
          </motion.div>

          {/* Bottom back button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center pb-10"
          >
            <Link
              href="/trips"
              className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to trips
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function InfoBadge({icon, label, value}: {
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