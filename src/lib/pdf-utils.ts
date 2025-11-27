import { PDFDocument, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyPdfjs: any = pdfjsLib;
if (anyPdfjs.GlobalWorkerOptions) {
  anyPdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export async function extractTextFromPdf(file: File): Promise<{
  text: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += `${pageText}\n\n`;
  }

  return { text: fullText.trim() };
}

export type PiiDetectionStatus = "pending" | "confirmed" | "rejected";

export type PiiDetection = {
  id: string;
  label: string;
  type: string;
  start: number;
  end: number;
  status: PiiDetectionStatus;
};

type SampleEntity = {
  id: string;
  label: string;
  text: string;
  start: number | null;
  end: number | null;
  confidence: number;
};

type SampleApiResponse = {
  entities: SampleEntity[];
};

export async function fakeDetectPiiFromApi(
  text: string
): Promise<PiiDetection[]> {
  // Simulate a /detect-pii API call by fetching a static JSON file.
  const res = await fetch("/sample1-entities.json");
  if (!res.ok) {
    throw new Error("Failed to fetch PII entities");
  }
  const data = (await res.json()) as SampleApiResponse;

  const detections: PiiDetection[] = [];

  for (const entity of data.entities) {
    let searchFrom = 0;
    let occurrenceIndex = 0;

    // Find all occurrences of the entity text in the extracted PDF texxt
    while (true) {
      const idx = text.indexOf(entity.text, searchFrom);
      if (idx === -1) break;

      const start = idx;
      const end = idx + entity.text.length;

      detections.push({
        id: `${entity.id}-${occurrenceIndex}`,
        label: entity.text,
        type: entity.label,
        start,
        end,
        status: "pending",
      });

      occurrenceIndex += 1;
      searchFrom = end;
    }
  }

  return detections;
}

export async function createRedactedPdfFromText(
  originalText: string,
  confirmedDetections: PiiDetection[]
): Promise<Uint8Array> {
  const sorted = [...confirmedDetections].sort((a, b) => a.start - b.start);

  let redactedText = "";
  let cursor = 0;

  for (const d of sorted) {
    if (d.start < cursor) continue;
    redactedText += originalText.slice(cursor, d.start);
    const length = Math.max(0, d.end - d.start);
    redactedText += "X".repeat(length || d.label.length || 3);
    cursor = d.end;
  }

  redactedText += originalText.slice(cursor);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 11;
  const margin = 40;
  const { width, height } = page.getSize();
  const maxWidth = width - margin * 2;

  const lines: string[] = [];
  const words = redactedText.split(/\s+/);
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  let currentPage = page;
  let y = height - margin;
  for (const line of lines) {
    if (y < margin) {
      currentPage = pdfDoc.addPage();
      y = currentPage.getSize().height - margin;
    }
    currentPage.drawText(line, {
      x: margin,
      y,
      size: fontSize,
      font,
    });
    y -= fontSize * 1.4;
  }

  const bytes = await pdfDoc.save();
  return new Uint8Array(bytes);
}
