import {
  type PiiDetection,
  type PiiDetectionStatus,
} from "../../lib/pdf-utils";
import { type DetectionWithIndex } from "./detection.types";

export type PiiSidebarProps = {
  fileName: string | null;
  detections: PiiDetection[];
  enrichedDetections: DetectionWithIndex[];
  selectedDetectionId: string | null;
  selectionPreview: string;
  onSelectDetection: (id: string) => void;
  onUpdateStatus: (id: string, status: PiiDetectionStatus) => void;
  onAddFromSelection: () => void;
};
