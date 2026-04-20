import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/mockData";

const config: Record<Priority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-priority-high/10 text-priority-high border-priority-high/20" },
  medium: { label: "Medium", className: "bg-priority-medium/10 text-priority-medium border-priority-medium/20" },
  low: { label: "Low", className: "bg-priority-low/10 text-priority-low border-priority-low/20" },
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const c = config[priority];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border", c.className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-priority-high": priority === "high",
        "bg-priority-medium": priority === "medium",
        "bg-priority-low": priority === "low",
      })} />
      {c.label}
    </span>
  );
};

export default PriorityBadge;
