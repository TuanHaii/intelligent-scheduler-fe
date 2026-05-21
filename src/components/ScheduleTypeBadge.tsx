import type { ScheduleRenderType } from "@/utils/schedule-utils";
import { Clock, Moon, Sun, CalendarDays } from "lucide-react";

const typeConfig: Record<ScheduleRenderType, {
  icon: typeof Clock;
  label: string;
  badgeClass: string;
  iconClass: string;
}> = {
  TIME_BLOCK: {
    icon: Clock,
    label: "Time Block",
    badgeClass: "bg-blue-500/15 border-blue-500/25 text-blue-600",
    iconClass: "text-blue-500",
  },
  LONG_EVENT: {
    icon: Moon,
    label: "Long Event",
    badgeClass: "bg-purple-500/15 border-purple-500/25 text-purple-600",
    iconClass: "text-purple-500",
  },
  ALL_DAY: {
    icon: Sun,
    label: "All Day",
    badgeClass: "bg-slate-500/15 border-slate-500/25 text-slate-600",
    iconClass: "text-slate-500",
  },
  MULTI_DAY: {
    icon: CalendarDays,
    label: "Multi Day",
    badgeClass: "bg-amber-500/15 border-amber-500/25 text-amber-600",
    iconClass: "text-amber-500",
  },
};

interface ScheduleTypeBadgeProps {
  type: ScheduleRenderType;
}

export function ScheduleTypeBadge({ type }: ScheduleTypeBadgeProps) {
  const config = typeConfig[type] ?? typeConfig.TIME_BLOCK;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1
        bg-white/8 border border-white/10 backdrop-blur-xl
        ${config.badgeClass}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
      <span className="text-xs font-semibold">{config.label}</span>
    </span>
  );
}
