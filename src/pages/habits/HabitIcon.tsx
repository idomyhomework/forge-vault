import { HABIT_ICON_MAP } from "../../utils/icons";

// ── HabitIcon ──────────────────────────────────────────────────────────────
export default function HabitIcon({
  icon,
  className = "w-3.5 h-3.5",
}: {
  icon: string;
  className?: string;
}) {
  const Icon = HABIT_ICON_MAP[icon];
  return Icon ? <Icon className={className} /> : null;
}
