import { stageLabel } from "@/lib/format";

export function StageBadge({ stage }: { stage: string }) {
  return <span className={`badge ${stage}`}>{stageLabel(stage)}</span>;
}
