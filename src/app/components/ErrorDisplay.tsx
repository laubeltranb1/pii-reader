"use client";

import React from "react";

type ErrorDisplayProps = {
  error: string | null;
};

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
      {error}
    </div>
  );
}

