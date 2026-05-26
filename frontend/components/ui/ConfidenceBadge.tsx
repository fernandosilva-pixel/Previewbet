import { cn, confidenceColor, confidenceLabel } from "@/lib/utils";
import type { Confidence } from "@/lib/types";

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold px-2 py-0.5 rounded border inline-block",
        confidenceColor(confidence)
      )}
    >
      {confidenceLabel(confidence)}
    </span>
  );
}
