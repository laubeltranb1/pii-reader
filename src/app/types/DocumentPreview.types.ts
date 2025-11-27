import { type DetectionWithIndex } from "./detection.types";

export type Fragment = {
  text: string;
  detection: DetectionWithIndex | null;
};

export type DocumentPreviewProps = {
  rawText: string;
  detections: DetectionWithIndex[];
  selectedDetectionId: string | null;
  onTextMouseUp: () => void;
};
