"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Wallet, Tag, Bus, MapPin } from "lucide-react";
import { TripResponse } from "@/types/trip";
import {
  getDestinationImage,
  getDestinationFlag,
  formatBudget,
  getCategoryStyle,
  getTravelStyleStyle,
} from "@/lib/destination";

interface TripCardProps {
  trip: TripResponse;
  index?: number;
}

export default function TripCard({ trip, index = 0 }: TripCardProps) {
  const heroImage = getDestinationImage(trip.destination);
  const flag = getDestinationFlag(trip.destination);
  const createdAt = new Date(trip.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const categoryStyle = getCategoryStyle(trip.category);
  const travelStyleStyle = getTravelStyleStyle(trip.travel_style);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/trips/${trip.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-violet-400/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)]">
          {/* Image */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={heroImage}
              alt={trip.destination}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium backdrop-blur-sm ${categoryStyle}`}
              >
                <Tag className="w-3 h-3" />
                {trip.category}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xl font-bold text-white drop-shadow-md">
                  {trip.destination}
                </h3>
                <span className="text-lg leading-none" aria-hidden>
                  {flag}
                </span>
              </div>
              <p className="text-white/50 text-xs">{createdAt}</p>
            </div>
          </div>

          {/* Info row */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoItem
                icon={<CalendarDays className="w-3.5 h-3.5" />}
                label="Duration"
                value={`${trip.days} Days`}
              />
              <InfoItem
                icon={<Wallet className="w-3.5 h-3.5" />}
                label="Budget"
                value={formatBudget(trip.budget)}
              />
              <InfoItem
                icon={<Bus className="w-3.5 h-3.5" />}
                label="Transport"
                value={trip.recommended_transport}
              />
              <InfoItem
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="Daily Budget"
                value={formatBudget(trip.daily_budget)}
              />
            </div>

            {/* Travel style badge */}
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${travelStyleStyle}`}
              >
                {trip.travel_style}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-md bg-white/5 text-white/40">{icon}</div>
      <div className="min-w-0">
        <p className="text-white/40 text-[10px] uppercase tracking-wider">{label}</p>
        <p className="text-white/80 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
