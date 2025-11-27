"use client";

import React from "react";

import DocumentPreview from "./components/DocumentPreview";
import PiiSidebar from "./components/PiiSidebar";
import { usePii } from "./contexts/PiiContext";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { DownloadButton } from "./components/DownloadButton";

export default function Home() {
  const {
    rawText,
    loading,
    error,
    handleUpload,
    handleGenerateRedactedPdf,
    isGeneratingPdf,
  } = usePii();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
        <div className="flex items-center justify-end gap-3">
          <DownloadButton
            onClick={handleGenerateRedactedPdf}
            disabled={!rawText || isGeneratingPdf}
            isGenerating={isGeneratingPdf}
          />
        </div>

        <ErrorDisplay error={error} />

        {!rawText && !loading && <EmptyState onUpload={handleUpload} />}

        {loading && <LoadingState />}

        {rawText && !loading && (
          <section className="flex flex-1 gap-4">
            <div className="w-full max-w-xs shrink-0 md:max-w-sm">
              <PiiSidebar />
            </div>
            <div className="flex-1 min-w-0">
              <DocumentPreview />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
