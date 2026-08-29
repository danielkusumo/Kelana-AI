"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Plane,
  Sparkles,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { TripResponse } from "@/types/trip";
import { getTrips } from "@/services/tripService";
import TripCard from "@/components/TripCard";
import RequireAuth from "@/components/RequireAuth";

type SortOption =
  | "newest"
  | "oldest"
  | "budget-low"
  | "budget-high"
  | "duration-short"
  | "duration-long";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest First",
  oldest: "Oldest First",
  "budget-low": "Budget: Low to High",
  "budget-high": "Budget: High to Low",
  "duration-short": "Duration: Short to Long",
  "duration-long": "Duration: Long to Short",
};

const ITEMS_PER_PAGE = 6;

export default function TripsPage() {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getTrips()
      .then((data) => {
        setTrips(data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load trips")
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.destination.toLowerCase().includes(q) ||
          trip.travel_style.toLowerCase().includes(q) ||
          trip.category.toLowerCase().includes(q) ||
          trip.recommended_transport.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "budget-low":
          return a.budget - b.budget;
        case "budget-high":
          return b.budget - a.budget;
        case "duration-short":
          return a.days - b.days;
        case "duration-long":
          return b.days - a.days;
        default:
          return 0;
      }
    });

    return result;
  }, [trips, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTrips.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTrips = filteredAndSortedTrips.slice(startIndex, endIndex);

  const hasTrips = trips.length > 0;
  const hasSearchResults = filteredAndSortedTrips.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers to show (max 5 visible)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <RequireAuth>
      <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
        <div className="nebula-1" />
        <div className="nebula-2" />

        <div className="relative z-10 flex flex-col flex-1 items-center px-4 py-8">
          {/* Logo */}
          {/* <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl mb-4"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/25">
                <Sparkles className="w-5 h-5 text-violet-300" />
              </div>
              <span className="text-lg font-bold tracking-tight">KelanaAI</span>
            </Link>
          </motion.div> */}

          {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="w-full max-w-5xl mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-violet-300" />
            <h1 className="text-3xl font-bold text-white">Your Trips</h1>
          </div>
          <p className="text-white/40 text-sm mt-1">
            All your AI-generated travel plans in one place
          </p>
        </motion.div>

        {/* Search & Sort Bar */}
        {hasTrips && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-5xl mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search by destination, style, category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11
                    text-white placeholder-white/30
                    focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20
                    transition-all duration-300 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs px-2 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10
                    text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20
                    transition-all duration-300 text-sm min-w-[200px] justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    {sortLabels[sortBy]}
                  </span>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
                </button>

                {showSortMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSortMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f0a1a]/95 backdrop-blur-xl
                        border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-hidden"
                    >
                      {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setCurrentPage(1);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                            ${
                              sortBy === option
                                ? "bg-violet-500/15 text-violet-200"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          {sortLabels[option]}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {/* Results count */}
            {isSearching && (
              <p className="text-white/30 text-xs mt-2 ml-1">
                {filteredAndSortedTrips.length} result
                {filteredAndSortedTrips.length !== 1 ? "s" : ""} found
              </p>
            )}
          </motion.div>
        )}

        {/* Content */}
        <div className="w-full max-w-5xl">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-white/50 text-sm">Loading trips...</p>
            </div>
          )}

          {!loading && error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-6 px-4"
            >
              {error}
            </motion.div>
          )}

          {!loading && !error && !hasTrips && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center py-16"
            >
              <GlassCard className="max-w-md w-full p-8 text-center">
                <div className="flex justify-center mb-5">
                  <div className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20">
                    <Plane className="w-10 h-10 text-violet-300" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  No trips found
                </h2>
                <p className="text-white/50 text-sm mb-6 leading-relaxed">
                  You haven&apos;t created any itineraries yet. Let our AI craft
                  your first adventure!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-700/80 via-violet-600/90 to-fuchsia-700/80 text-white font-medium hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600 transition-all duration-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Create your first itinerary
                </Link>
              </GlassCard>
            </motion.div>
          )}

          {!loading && !error && hasTrips && !hasSearchResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center py-16"
            >
              <GlassCard className="max-w-md w-full p-8 text-center">
                <div className="flex justify-center mb-5">
                  <div className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20">
                    <Search className="w-10 h-10 text-violet-300" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  No trips match your search
                </h2>
                <p className="text-white/50 text-sm mb-6 leading-relaxed">
                  Try adjusting your search terms or clear the filter to see all
                  trips.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-700/80 via-violet-600/90 to-fuchsia-700/80 text-white font-medium hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600 transition-all duration-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Clear search
                </button>
              </GlassCard>
            </motion.div>
          )}

          {!loading && !error && hasSearchResults && (
            <>
              {/* Showing info */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/30 text-xs">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedTrips.length)} of{" "}
                  {filteredAndSortedTrips.length} trip
                  {filteredAndSortedTrips.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedTrips.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mt-10"
                >
                  {/* Previous */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                      bg-white/5 border border-white/10 text-white/60
                      hover:bg-white/10 hover:text-white hover:border-white/20
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-white/60
                      transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-3 py-2 text-white/30 text-sm"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page as number)}
                          className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                            ${
                              currentPage === page
                                ? "bg-violet-500/20 border border-violet-500/40 text-violet-200"
                                : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                      bg-white/5 border border-white/10 text-white/60
                      hover:bg-white/10 hover:text-white hover:border-white/20
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-white/60
                      transition-all duration-300"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </>
          )}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
