"use client";

import React from "react";

type DownloadButtonProps = {
  onClick: () => Promise<void>;
  disabled: boolean;
  isGenerating: boolean;
};

export function DownloadButton({
  onClick,
  disabled,
  isGenerating,
}: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        !disabled && !isGenerating
          ? "bg-sky-500 text-white hover:bg-sky-400"
          : "cursor-not-allowed bg-slate-800 text-slate-500"
      }`}
    >
      {isGenerating ? "Redacting..." : "Download Redacted PDF"}
    </button>
  );
}

