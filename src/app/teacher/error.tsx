"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to mock monitoring system (Sentry, LogRocket, etc.)
    const errorLog = {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      page: typeof window !== "undefined" ? window.location.pathname : "teacher-portal",
      role: "TEACHER",
      timestamp: new Date().toISOString()
    };
    console.warn("Monitoring Log (Sentry/LogRocket Mock):", errorLog);
  }, [error]);

  // Determine error type/message
  const errMsg = error.message || "";
  let errorTitle = "Something went wrong";
  let errorDesc = "An unexpected error occurred. Please try again or contact support.";
  
  if (errMsg.includes("fetch") || errMsg.includes("network") || errMsg.includes("Failed to fetch") || errMsg.includes("Connection")) {
    errorTitle = "Network Connection Failed";
    errorDesc = "Connection failed. Check your internet connection and try again.";
  } else if (errMsg.includes("500") || errMsg.includes("server") || errMsg.includes("database") || errMsg.includes("Prisma")) {
    errorTitle = "Server Error (500)";
    errorDesc = "Server error (500). Our development team is investigating. Retry in a moment.";
  } else if (errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("deleted") || errMsg.includes("NotFound")) {
    errorTitle = "Data Not Found";
    errorDesc = "The requested data was not found. It may have been deleted or moved.";
  }

  return (
    <div className="min-h-[500px] flex items-center justify-center p-8">
      <div className="bg-bg-card border border-border shadow-shadow-elevated max-w-md w-full p-8 rounded-3xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-350">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-bold text-text-heading mb-3">{errorTitle}</h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          {errorDesc}
        </p>

        {/* Debug trace details placeholder (hidden in production normally, but good for admin debugging) */}
        <div className="text-left bg-bg-app border border-border rounded-xl p-3.5 mb-6 max-h-28 overflow-y-auto">
          <div className="text-[10px] font-mono text-text-muted break-all">
            <strong>Error Message:</strong> {error.message}
            {error.digest && <><br /><strong>Digest:</strong> {error.digest}</>}
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full flex items-center justify-center px-4 py-2.5 bg-primary text-text-on-primary rounded-xl shadow-shadow-btn hover:bg-primary-mid transition-all font-semibold cursor-pointer gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
  );
}
