import { useState } from "react";
import { motion } from "framer-motion";
import { CATEGORY_ICON_MAP } from "../../utils/icons";
import type { Transaction, Category, TransactionType } from "../../types";

// ── Add Transaction Modal ──────────────────────────────────────────────────
export default function AddTransactionModal({
  categories,
  onAdd,
  onClose,
}: {
  categories: Category[];
  onAdd: (t: Omit<Transaction, "id" | "date">) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<TransactionType>("gasto");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filtered = categories.filter((c) => c.type === type);

  const handleSubmit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0 || !categoryId) return;
    onAdd({ amount: n, type, categoryId, description: desc });
    onClose();
  };

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
            Nueva transacción
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
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                type === t
                  ? t === "ingreso"
                    ? "bg-emerald-500 text-surface"
                    : "bg-red-500 text-surface"
                  : "bg-transparent text-muted hover:text-fore"
              }`}
            >
              {t === "ingreso" ? "➕ Ingreso" : "➖ Gasto"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted text-sm">
            US$
          </span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-card2 rounded-xl pl-12 pr-4 py-3 text-fore text-sm font-bold border border-line focus:outline-none focus:border-acid transition-colors"
          />
        </div>

        {/* Description */}
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full bg-card2 rounded-xl px-4 py-3 text-fore text-sm border border-line focus:outline-none focus:border-acid placeholder:text-muted transition-colors"
        />

        {/* Category grid */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Categoría
          </p>
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`rounded-xl py-2 px-1 flex flex-col items-center gap-1 border font-mono text-xs uppercase transition-all ${
                  categoryId === cat.id
                    ? type === "ingreso"
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                      : "border-crimson bg-crimson/10 text-crimson"
                    : "border-line bg-card2 text-muted hover:border-acid/50"
                }`}
              >
                {(() => {
                  const Icon = CATEGORY_ICON_MAP[cat.icon];
                  return Icon ? <Icon className="w-4 h-4" /> : null;
                })()}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || !categoryId}
          className="bg-acid hover:bg-acid2 disabled:opacity-30 disabled:cursor-not-allowed text-surface font-display uppercase tracking-wide rounded-2xl py-3 transition-all active:scale-95"
        >
          Añadir transacción
        </button>
      </motion.div>
    </motion.div>
  );
}
