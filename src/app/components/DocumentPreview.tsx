"use client";

import React, { useMemo } from "react";

import { classNames } from "./classNames";
import { DocumentPreviewProps, Fragment } from "../types/DocumentPreview.types";

export function DocumentPreview({
  rawText,
  detections,
  selectedDetectionId,
  onTextMouseUp,
}: DocumentPreviewProps) {
  const fragments: Fragment[] = useMemo(() => {
    if (!rawText) return [];
    if (detections.length === 0) {
      return [{ text: rawText, detection: null }];
    }

    const parts: Fragment[] = [];
    let cursor = 0;

    for (const d of detections) {
      if (d.start > cursor) {
        parts.push({
          text: rawText.slice(cursor, d.start),
          detection: null,
        });
      }
      parts.push({
        text: rawText.slice(d.start, d.end),
        detection: d,
      });
      cursor = d.end;
    }

    if (cursor < rawText.length) {
      parts.push({
        text: rawText.slice(cursor),
        detection: null,
      });
    }

    return parts;
  }, [detections, rawText]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <div>
          <p className="font-medium text-slate-100">Document preview</p>
          <p>
            PII is highlighted in{" "}
            <span className="font-semibold text-red-300">red</span>. Rejected
            entries are not highlighted.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-red-400" />
          <span className="text-[11px] text-slate-400">
            Confirmed / pending PII
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <div
          className="h-full max-h-[70vh] overflow-auto px-3 py-3 text-[11px] leading-relaxed text-slate-100"
          onMouseUp={onTextMouseUp}
        >
          <pre className="whitespace-pre-wrap wrap-break-word font-mono text-[11px]">
            {fragments.map((frag, idx) => {
              if (!frag.detection) {
                return (
                  <span key={`frag-${idx}`} className="text-slate-100">
                    {frag.text}
                  </span>
                );
              }

              const isRejected = frag.detection.status === "rejected";
              const isConfirmed = frag.detection.status === "confirmed";

              if (isRejected) {
                return (
                  <span
                    key={`frag-${idx}`}
                    className="bg-transparent text-slate-300"
                  >
                    {frag.text}
                  </span>
                );
              }

              return (
                <span
                  key={`frag-${idx}`}
                  className={classNames(
                    "rounded px-0.5",
                    "bg-red-500/20 text-red-100 underline decoration-red-400/70 decoration-2 underline-offset-[3px]",
                    selectedDetectionId === frag.detection.id &&
                      "outline outline-red-400",
                    isConfirmed && "bg-red-500/30 font-semibold"
                  )}
                >
                  {frag.text}
                </span>
              );
            })}
          </pre>
        </div>
      </div>
    </section>
  );
}

export default DocumentPreview;
