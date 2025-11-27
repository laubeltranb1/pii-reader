"use client";

import React from "react";

type EmptyStateProps = {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-md rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-8 text-center">
        <p className="mb-2 text-sm font-medium text-slate-100">
          Start by uploading a PDF
        </p>
        <p className="mb-4 text-xs text-slate-400">
          The document text will be extracted in the browser, sent to a
          simulated `/detect-pii` endpoint, and you will be able to approve,
          reject, and add PII before downloading a redacted PDF.
        </p>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-xs font-medium text-slate-100 shadow-sm hover:bg-slate-700">
          <span>Choose PDF file</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={onUpload}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}

