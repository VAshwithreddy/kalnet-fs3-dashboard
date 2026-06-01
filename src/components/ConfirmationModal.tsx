"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-bg-card border border-border shadow-shadow-elevated rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-heading bg-bg-app border border-border hover:bg-bg-input rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-4">
            <div className={`p-3 rounded-2xl w-12 h-12 flex items-center justify-center shrink-0 ${isDestructive ? 'bg-danger/10 text-danger' : 'bg-primary-ghost text-primary'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-heading mb-2">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-bg-card-hover border-t border-border flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-bg-app border border-border rounded-xl text-text-heading hover:bg-bg-input transition-all text-sm font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-white transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] ${
              isDestructive
                ? "bg-danger hover:bg-danger-mid shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
                : "bg-primary hover:bg-primary-mid shadow-[0_4px_12px_rgba(139,92,246,0.2)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
