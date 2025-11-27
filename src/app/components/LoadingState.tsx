"use client";

import React from "react";

export function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-200">
        <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
        Processing PDF and detecting PII...
      </div>
    </div>
  );
}

