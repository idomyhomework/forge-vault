// ── Check button ───────────────────────────────────────────────────────────
export default function CheckBox({
  checked,
  color,
  onToggle,
}: {
  checked: boolean;
  color: string;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out active:scale-90 ${
        checked
          ? `${color} shadow-lg`
          : "bg-card2 hover:bg-line border border-line"
      }`}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-surface transition-opacity duration-300"
        style={{ opacity: checked ? 1 : 0 }}
      >
        <polyline points="2,8 6,12 14,4" />
      </svg>
    </button>
  );
}
