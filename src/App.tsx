import { useState } from "react";
import {
  CheckSquare,
  Banknote,
  Dumbbell,
  PiggyBank,
  NotebookText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tab } from "./types";
import Habits from "./pages/Habits";
import Finance from "./pages/Finance";
import Notes from "./pages/Notes";
import "./App.css";

// ── Tab config ─────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: "habitos", label: "Hábitos", Icon: CheckSquare },
  { id: "finanzas", label: "Finanzas", Icon: Banknote },
  { id: "gym", label: "Gym", Icon: Dumbbell },
  { id: "ahorros", label: "Ahorros", Icon: PiggyBank },
  { id: "notas", label: "Notas", Icon: NotebookText },
];

// ── Placeholder for unbuilt modules ───────────────────────────────────────
function ComingSoon({ label, Icon }: { label: string; Icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Icon className="w-16 h-16 opacity-20 text-muted" strokeWidth={1} />
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {label}
        </p>
        <p className="font-mono text-xs mt-1 text-acid">— próximamente —</p>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("habitos");

  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-line px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] flex items-center justify-between">
        <h1 className="font-display text-lg text-fore tracking-tight uppercase">
          Forge<span className="text-acid">Vault</span>
        </h1>
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
          {TABS.find((t) => t.id === activeTab)?.label}
        </span>
      </div>

      {/* Page content */}
      <main className="px-4 pt-5 pb-24 max-w-lg mx-auto">
        {activeTab === "habitos" && <Habits />}
        {activeTab === "finanzas" && <Finance />}
        {activeTab === "gym" && <ComingSoon label="Gym" Icon={Dumbbell} />}
        {activeTab === "ahorros" && (
          <ComingSoon label="Ahorros" Icon={PiggyBank} />
        )}
        {activeTab === "notas" && <Notes />}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface2/95 backdrop-blur-md border-t border-line flex justify-around px-2 py-2 z-40">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all active:scale-95 ${
              activeTab === tab.id ? "text-acid" : "text-muted hover:text-fore"
            }`}
          >
            <tab.Icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
