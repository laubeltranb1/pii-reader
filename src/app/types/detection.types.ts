import { type PiiDetection } from "../../lib/pdf-utils";

export type DetectionWithIndex = PiiDetection & { index: number };
