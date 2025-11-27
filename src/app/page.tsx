"use client";

import { useCallback, useMemo, useState } from "react";

import DocumentPreview from "./components/DocumentPreview";
import PiiSidebar from "./components/PiiSidebar";
import {
  PiiDetection,
  PiiDetectionStatus,
  createRedactedPdfFromText,
  fakeDetectPiiFromApi,
  extractTextFromPdf,
} from "../lib/pdf-utils";
import { type DetectionWithIndex } from "./types/detection.types";

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [detections, setDetections] = useState<PiiDetection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(
    null
  );
  const [selectionPreview, setSelectionPreview] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }

      setError(null);
      setLoading(true);
      setFileName(file.name);
      setDetections([]);
      setRawText("");

      try {
        const { text } = await extractTextFromPdf(file);
        setRawText(text);

        // Fake /detect-pii API call using  JSON
        const detected = await fakeDetectPiiFromApi(text);
        setDetections(detected);
      } catch {
        setError("Failed to read PDF. Please try another file.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateDetectionStatus = useCallback(
    (id: string, status: PiiDetectionStatus) => {
      setDetections((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
    },
    []
  );

  const handleAddFromSelection = useCallback(() => {
    if (!rawText) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selected = selection.toString().trim();
    if (!selected) return;

    const start = rawText.indexOf(selected);
    if (start === -1) return;
    const end = start + selected.length;

    const newDetection: PiiDetection = {
      id: `CUSTOM-${Date.now()}`,
      label: selected,
      type: "CUSTOM",
      start,
      end,
      status: "confirmed",
    };

    setDetections((prev) => [...prev, newDetection]);
    setSelectionPreview(selected);
  }, [rawText]);

  const handleGenerateRedactedPdf = useCallback(async () => {
    if (!rawText) return;
    const confirmed = detections.filter((d) => d.status === "confirmed");
    if (confirmed.length === 0) {
      setError("There is no confirmed PII to redact.");
      return;
    }

    setError(null);
    setIsGeneratingPdf(true);
    try {
      const bytes = await createRedactedPdfFromText(rawText, confirmed);
      const blob = new Blob([bytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName
        ? fileName.replace(/\.pdf$/i, "") + ".redacted.pdf"
        : "redacted.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to generate redacted PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [detections, fileName, rawText]);

  const enrichedDetections: DetectionWithIndex[] = useMemo(
    () =>
      detections
        .map((d, index) => ({ ...d, index }))
        .sort((a, b) => a.start - b.start),
    [detections]
  );

  const onTextMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const selected = sel.toString().trim();
    setSelectionPreview(selected);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleGenerateRedactedPdf}
            disabled={!rawText || isGeneratingPdf}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              rawText && !isGeneratingPdf
                ? "bg-sky-500 text-white hover:bg-sky-400"
                : "cursor-not-allowed bg-slate-800 text-slate-500"
            }`}
          >
            {isGeneratingPdf ? "Redacting..." : "Download Redacted PDF"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {!rawText && !loading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-md rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-8 text-center">
              <p className="mb-2 text-sm font-medium text-slate-100">
                Start by uploading a PDF
              </p>
              <p className="mb-4 text-xs text-slate-400">
                The document text will be extracted in the browser, sent to a
                simulated `/detect-pii` endpoint, and you will be able to
                approve, reject, and add PII before downloading a redacted PDF.
              </p>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-xs font-medium text-slate-100 shadow-sm hover:bg-slate-700">
                <span>Choose PDF file</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
              Processing PDF and detecting PII...
            </div>
          </div>
        )}

        {rawText && !loading && (
          <section className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(260px,320px),minmax(0,1fr)]">
            <PiiSidebar
              fileName={fileName}
              detections={detections}
              enrichedDetections={enrichedDetections}
              selectedDetectionId={selectedDetectionId}
              selectionPreview={selectionPreview}
              onSelectDetection={setSelectedDetectionId}
              onUpdateStatus={updateDetectionStatus}
              onAddFromSelection={handleAddFromSelection}
            />

            <DocumentPreview
              rawText={rawText}
              detections={enrichedDetections}
              selectedDetectionId={selectedDetectionId}
              onTextMouseUp={onTextMouseUp}
            />
          </section>
        )}
      </main>
    </div>
  );
}
