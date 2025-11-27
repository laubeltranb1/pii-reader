"use client";

import React from "react";

import { classNames } from "./classNames";
import { type PiiSidebarProps } from "../types/PiiSidebar.types";

export function PiiSidebar({
  fileName,
  detections,
  enrichedDetections,
  selectedDetectionId,
  selectionPreview,
  onSelectDetection,
  onUpdateStatus,
  onAddFromSelection,
}: PiiSidebarProps) {
  const confirmedCount = detections.filter(
    (d) => d.status === "confirmed"
  ).length;
  const pendingCount = detections.filter((d) => d.status === "pending").length;

  return (
    <aside className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Detected PII
          </p>
          <p className="text-[11px] text-slate-500">
            {fileName || "Untitled document"}
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <div>{confirmedCount} confirmed</div>
          <div>{pendingCount} pending</div>
        </div>
      </div>

      <div className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
        {enrichedDetections.length === 0 && (
          <p className="text-[11px] text-slate-500">
            No PII detected yet. You can still add entries by selecting text in
            the document.
          </p>
        )}

        {enrichedDetections.map((d) => (
          <div
            key={d.id}
            onClick={() => onSelectDetection(d.id)}
            className={classNames(
              "group flex w-full flex-col gap-1 rounded-xl border px-2 py-2 text-left text-[11px] transition cursor-pointer",
              selectedDetectionId === d.id
                ? "border-sky-500/70 bg-sky-500/10"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-200">
                {d.type}
              </span>
              <span
                className={classNames(
                  "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  d.status === "confirmed" &&
                    "bg-emerald-500/15 text-emerald-200",
                  d.status === "rejected" && "bg-slate-800 text-slate-400",
                  d.status === "pending" && "bg-amber-500/15 text-amber-200"
                )}
              >
                {d.status}
              </span>
            </div>
            <p className="line-clamp-2 text-[11px] text-slate-100">{d.label}</p>
            <div className="flex gap-1 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(d.id, "confirmed");
                }}
                className={classNames(
                  "flex-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  d.status === "confirmed"
                    ? "bg-emerald-500 text-emerald-950"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                )}
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(d.id, "rejected");
                }}
                className={classNames(
                  "flex-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  d.status === "rejected"
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                )}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/60 p-2">
        <p className="mb-1 text-[11px] font-medium text-slate-200">
          Add missing PII
        </p>
        <p className="mb-2 text-[11px] text-slate-500">
          Select text in the document view and then click the button below to
          add it as PII.
        </p>
        <button
          type="button"
          onClick={onAddFromSelection}
          className="w-full rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 hover:bg-slate-700"
        >
          Use current text selection
        </button>
        {selectionPreview && (
          <p className="mt-2 line-clamp-3 rounded-md bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300">
            “{selectionPreview}”
          </p>
        )}
      </div>
    </aside>
  );
}

export default PiiSidebar;
