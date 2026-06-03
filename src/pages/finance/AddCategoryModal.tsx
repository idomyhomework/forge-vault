import { useState } from "react";
import { motion } from "framer-motion";
import { CATEGORY_ICON_MAP, CATEGORY_ICON_KEYS } from "../../utils/icons";
import type { Category, TransactionType } from "../../types";

// ── Add Category Modal ─────────────────────────────────────────────────────
export default function AddCategoryModal({
  onAdd,
  onClose,
}: {
  onAdd: (c: Omit<Category, "id">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("banknote");
  const [type, setType] = useState<TransactionType>("gasto");

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-card rounded-3xl w-full max-w-sm p-5 border border-line flex flex-col gap-4 mb-16"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base uppercase tracking-wide text-fore">
            Nueva categoría
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-fore text-2xl leading-none w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-line">
          {(["ingreso", "gasto"] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                type === t
                  ? t === "ingreso"
                    ? "bg-emerald-500 text-surface"
                    : "bg-red-500 text-surface"
                  : "bg-transparent text-muted hover:text-fore"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-card2 rounded-xl px-4 py-3 text-fore text-sm border border-line focus:outline-none focus:border-acid placeholder:text-muted transition-colors"
        />

        {/* Icon picker */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Icono
          </p>
          <div className="grid grid-cols-10 gap-1">
            {CATEGORY_ICON_KEYS.map((key) => {
              const Icon = CATEGORY_ICON_MAP[key];
              return (
                <button
                  key={key}
                  onClick={() => setIcon(key)}
                  className={`flex items-center justify-center rounded-lg p-2 transition-all ${
                    icon === key
                      ? "bg-acid/15 ring-1 ring-acid text-acid"
                      : "hover:bg-card2 text-muted hover:text-fore"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            if (name.trim()) {
              onAdd({ name: name.trim(), icon, type });
              onClose();
            }
          }}
          disabled={!name.trim()}
          className="bg-acid hover:bg-acid2 disabled:opacity-30 text-surface font-display uppercase tracking-wide rounded-2xl py-3 transition-all active:scale-95"
        >
          Crear categoría
        </button>
      </motion.div>
    </motion.div>
  );
}
