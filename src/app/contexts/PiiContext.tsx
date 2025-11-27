"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  type PiiDetection,
  type PiiDetectionStatus,
  createRedactedPdfFromText,
  fakeDetectPiiFromApi,
  extractTextFromPdf,
} from "../../lib/pdf-utils";
import { type DetectionWithIndex } from "../types/detection.types";

type PiiContextType = {
  // States
  fileName: string | null;
  rawText: string;
  detections: PiiDetection[];
  loading: boolean;
  error: string | null;
  selectedDetectionId: string | null;
  selectionPreview: string;
  isGeneratingPdf: boolean;
  enrichedDetections: DetectionWithIndex[];

  // Actions
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateDetectionStatus: (id: string, status: PiiDetectionStatus) => void;
  handleConfirmAll: () => void;
  handleRejectAll: () => void;
  handleAddFromSelection: () => void;
  handleGenerateRedactedPdf: () => Promise<void>;
  setSelectedDetectionId: (id: string | null) => void;
  onTextMouseUp: () => void;
};

const PiiContext = createContext<PiiContextType | undefined>(undefined);

export function PiiProvider({ children }: { children: React.ReactNode }) {
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

        // Fake /detect-pii API call using JSON
        const detected = await fakeDetectPiiFromApi(text);
        setDetections(detected);
      } catch (err) {
        console.error("PDF upload error:", err);
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

  const handleConfirmAll = useCallback(() => {
    setDetections((prev) =>
      prev.map((d) => ({ ...d, status: "confirmed" as PiiDetectionStatus }))
    );
  }, []);

  const handleRejectAll = useCallback(() => {
    setDetections((prev) =>
      prev.map((d) => ({ ...d, status: "rejected" as PiiDetectionStatus }))
    );
  }, []);

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

      const uint8Array = new Uint8Array(bytes);
      const blob = new Blob([uint8Array.buffer], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName
        ? fileName.replace(/\.pdf$/i, "") + ".redacted.pdf"
        : "redacted.pdf";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError(
        err instanceof Error
          ? `Failed to generate redacted PDF: ${err.message}`
          : "Failed to generate redacted PDF."
      );
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

  const value: PiiContextType = useMemo(
    () => ({
      fileName,
      rawText,
      detections,
      loading,
      error,
      selectedDetectionId,
      selectionPreview,
      isGeneratingPdf,
      enrichedDetections,
      handleUpload,
      updateDetectionStatus,
      handleConfirmAll,
      handleRejectAll,
      handleAddFromSelection,
      handleGenerateRedactedPdf,
      setSelectedDetectionId,
      onTextMouseUp,
    }),
    [
      fileName,
      rawText,
      detections,
      loading,
      error,
      selectedDetectionId,
      selectionPreview,
      isGeneratingPdf,
      enrichedDetections,
      handleUpload,
      updateDetectionStatus,
      handleConfirmAll,
      handleRejectAll,
      handleAddFromSelection,
      handleGenerateRedactedPdf,
      onTextMouseUp,
    ]
  );

  return <PiiContext.Provider value={value}>{children}</PiiContext.Provider>;
}

export function usePii() {
  const context = useContext(PiiContext);
  if (context === undefined) {
    throw new Error("usePii must be used within a PiiProvider");
  }
  return context;
}
