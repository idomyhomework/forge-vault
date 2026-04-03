import { useState } from "react";
import type { Tab } from "./types";
import Habits from "./pages/Habits";
import Finance from "./pages/finance";
import "./App.css";

// ── Tab config ─────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "habitos", label: "Hábitos", icon: "✅" },
  { id: "finanzas", label: "Finanzas", icon: "💸" },
  { id: "gym", label: "Gym", icon: "🏋️" },
  { id: "ahorros", label: "Ahorros", icon: "🎯" },
];

// ── Placeholder for unbuilt modules ───────────────────────────────────────
function ComingSoon({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-600">
      <span className="text-6xl opacity-30">{icon}</span>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="text-xs mt-1 text-slate-700">Próximamente</p>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("habitos");

  return (
    <div className="min-h-screen bg-[#0f0f1a] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f0f1a]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-black text-white tracking-tight">
          Stark<span className="text-red-500">Lab</span>
        </h1>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          {TABS.find((t) => t.id === activeTab)?.label}
        </span>
      </div>

      {/* Page content */}
      <main className="px-4 pt-5 pb-24 max-w-lg mx-auto">
        {activeTab === "habitos" && <Habits />}
        {activeTab === "finanzas" && <Finance />}
        {activeTab === "gym" && <ComingSoon label="Gym" icon="🏋️" />}
        {activeTab === "ahorros" && <ComingSoon label="Ahorros" icon="🎯" />}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#16162a]/95 backdrop-blur-md border-t border-white/5 flex justify-around px-2 py-2 z-40">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all active:scale-95 ${
              activeTab === tab.id
                ? "bg-red-500/15 text-red-400"
                : "text-slate-600 hover:text-slate-400"
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
