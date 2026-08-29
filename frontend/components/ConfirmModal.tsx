"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm rounded-2xl bg-[#0f0a1a]/95 backdrop-blur-xl border border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <h3 className="text-lg font-bold text-white text-center mb-2">{title}</h3>
        {description && (
          <p className="text-white/50 text-sm text-center mb-6 leading-relaxed">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={
              danger
                ? "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50"
                : "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-200 hover:bg-violet-500/30 transition-all duration-300 disabled:opacity-50"
            }
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}