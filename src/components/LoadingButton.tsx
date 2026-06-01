"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading,
  loadingText,
  children,
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all ${
        loading ? "opacity-75 cursor-not-allowed" : ""
      } ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
      {loading ? (loadingText || children) : children}
    </button>
  );
}
