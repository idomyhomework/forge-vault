import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Banknote } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
import { CATEGORY_ICON_MAP } from "../utils/icons";
import { uid } from "../utils/uid";
import { DEFAULT_CATEGORIES } from "../utils/financeConstants";
import type { Transaction, Category, TransactionType } from "../types";
import StatCard from "./finance/StatCard";
import AddTransactionModal from "./finance/AddTransactionModal";
import AddCategoryModal from "./finance/AddCategoryModal";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `US$ ${Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: 0 })}`;
}

// ── Finance Page ───────────────────────────────────────────────────────────
export default function Finance() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    STORAGE_KEYS.transactions,
    [],
  );
  const [categories, setCategories] = useLocalStorage<Category[]>(
    STORAGE_KEYS.categories,
    DEFAULT_CATEGORIES,
  );
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");

  // ── Derived values ─────────────────────────────────────────────────────
  const { totalIngresos, totalGastos, saldo } = useMemo(() => {
    const totalIngresos = transactions
      .filter((t) => t.type === "ingreso")
      .reduce((s, t) => s + t.amount, 0);
    const totalGastos = transactions
      .filter((t) => t.type === "gasto")
      .reduce((s, t) => s + t.amount, 0);
    return { totalIngresos, totalGastos, saldo: totalIngresos - totalGastos };
  }, [transactions]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const addTransaction = (t: Omit<Transaction, "id" | "date">) => {
    setTransactions((prev) => [
      { ...t, id: uid(), date: new Date().toISOString() },
      ...prev,
    ]);
  };

  const addCategory = (c: Omit<Category, "id">) => {
    setCategories((prev) => [...prev, { ...c, id: uid() }]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getCat = (id: string) => categories.find((c) => c.id === id);

  const filtered =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Saldo"
          value={fmt(saldo)}
          color={saldo >= 0 ? "text-fore" : "text-crimson"}
        />
        <StatCard
          label="Ingresos"
          value={fmt(totalIngresos)}
          color="text-emerald-400"
        />
        <StatCard
          label="Gastos"
          value={fmt(totalGastos)}
          color="text-crimson"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddTx(true)}
          className="flex-1 bg-acid hover:bg-acid2 text-surface font-display uppercase tracking-wide rounded-2xl py-3 text-sm transition-all active:scale-95"
        >
          + Transacción
        </button>
        <button
          onClick={() => setShowAddCat(true)}
          className="bg-card border border-line text-fore font-mono rounded-2xl px-4 py-3 text-xs uppercase tracking-wider hover:border-acid transition-all active:scale-95"
        >
          + Cat
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-xl overflow-hidden border border-line bg-card">
        {(["all", "ingreso", "gasto"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              filterType === f
                ? "bg-acid/15 text-acid"
                : "text-muted hover:text-fore"
            }`}
          >
            {f === "all" ? "Todo" : f === "ingreso" ? "Ingresos" : "Gastos"}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Banknote
            className="w-10 h-10 mx-auto mb-3 opacity-20 text-muted"
            strokeWidth={1}
          />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Sin transacciones aún
          </p>
          <p className="font-mono text-[10px] mt-1 text-acid/60">
            Pulsa "+ Transacción" para empezar
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((tx) => {
            const cat = getCat(tx.categoryId);
            return (
              <div
                key={tx.id}
                className="bg-card rounded-2xl px-4 py-3 flex items-center gap-3 border border-line group hover:border-acid/30 transition-colors"
              >
                {(() => {
                  const Icon = cat
                    ? (CATEGORY_ICON_MAP[cat.icon] ?? Banknote)
                    : Banknote;
                  return <Icon className="w-5 h-5 text-muted flex-shrink-0" />;
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-fore truncate">
                    {tx.description || cat?.name || "Transacción"}
                  </p>
                  <p className="font-mono text-[10px] text-muted">
                    {cat?.name} ·{" "}
                    {new Date(tx.date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`font-mono text-sm font-bold flex-shrink-0 ${
                    tx.type === "ingreso" ? "text-emerald-400" : "text-crimson"
                  }`}
                >
                  {tx.type === "ingreso" ? "+" : "-"}
                  {fmt(tx.amount)}
                </span>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-crimson transition-all ml-1 text-xl leading-none w-6 h-6 flex items-center justify-center flex-shrink-0"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer summary */}
      {transactions.length > 0 && (
        <div className="bg-card rounded-2xl px-4 py-3 border border-line flex justify-between items-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {transactions.length} transacción
            {transactions.length !== 1 ? "es" : ""}
          </span>
          <span
            className={`font-mono text-xs font-bold ${saldo >= 0 ? "text-emerald-400" : "text-crimson"}`}
          >
            Balance: {saldo >= 0 ? "+" : ""}
            {saldo < 0 ? "-" : ""}
            {fmt(saldo)}
          </span>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddTx && (
          <AddTransactionModal
            categories={categories}
            onAdd={addTransaction}
            onClose={() => setShowAddTx(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddCat && (
          <AddCategoryModal
            onAdd={addCategory}
            onClose={() => setShowAddCat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
