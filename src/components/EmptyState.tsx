"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/60 bg-bg-card/40 rounded-2xl transition-all duration-300 hover:border-border hover:bg-bg-card-hover/40 min-h-[300px]">
      <div className="p-4 bg-primary-ghost/60 rounded-full text-primary mb-4 animate-bounce duration-1000">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-text-heading mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-text-on-primary rounded-xl shadow-shadow-btn hover:bg-primary-mid transition-all font-semibold hover:scale-[1.02] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
