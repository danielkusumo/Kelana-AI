"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Mail, User, Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import StarField from "@/components/trip-planner/StarField";
import RequireAuth from "@/components/RequireAuth";
import ConfirmModal from "@/components/ConfirmModal";
import { AuthUser } from "@/types/auth";
import { getCurrentUser, getInitials, clearSession } from "@/services/authService";

function ProfileInner() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    clearSession();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 text-violet-400 animate-spin rounded-full border-2 border-violet-400/40 border-t-violet-300" />
        <p className="text-white/50 text-sm">Loading profile...</p>
      </div>
    );
  }

  const name = user?.name || "Traveler";
  const email = user?.email || "-";
  const initials = getInitials(name);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-8">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <Link
          href="/trips"
          className="ml-auto inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
        >
          <Sparkles className="w-4 h-4" />
          My Trips
        </Link>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-8 text-center">
          {/* Avatar placeholder (IG style) */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 p-[3px]">
                <div className="w-full h-full rounded-full bg-[#0f0a1a] flex items-center justify-center">
                  <span className="text-3xl font-bold text-violet-200">
                    {initials}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
          <p className="text-white/40 text-sm mb-6">{email}</p>

          {/* Info rows */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <InfoTile icon={<User className="w-4 h-4" />} label="Name" value={name} />
            <InfoTile icon={<Mail className="w-4 h-4" />} label="Email" value={email} />
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </GlassCard>
      </motion.div>

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
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-left">
      <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-white/90 text-sm font-medium truncate">{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
        <StarField />
        <div className="nebula-1" />
        <div className="nebula-2" />

        <div className="relative z-10 flex flex-col flex-1 items-center px-4 py-8">
          <ProfileInner />
        </div>
      </main>
    </RequireAuth>
  );
}
