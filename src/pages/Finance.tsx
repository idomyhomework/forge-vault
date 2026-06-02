import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
import { CATEGORY_ICON_MAP, CATEGORY_ICON_KEYS } from "../utils/icons";
import type { Transaction, Category, TransactionType } from "../types";

// ── Default categories ─────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: Category[] = [
  { id: "salario", name: "Salario", icon: "banknote", type: "ingreso" },
  { id: "freelance", name: "Freelance", icon: "laptop", type: "ingreso" },
  { id: "comida", name: "Comida", icon: "utensils", type: "gasto" },
  { id: "transporte", name: "Transporte", icon: "car", type: "gasto" },
  { id: "ocio", name: "Ocio", icon: "gamepad", type: "gasto" },
  { id: "streaming", name: "Streaming", icon: "tv", type: "gasto" },
  { id: "salud", name: "Salud", icon: "heartPulse", type: "gasto" },
];

// ── Icon options ─────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = CATEGORY_ICON_KEYS;

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `US$ ${Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: 0 })}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-3 flex flex-col gap-1 border border-line">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className={`text-lg font-black ${color}`}>{value}</span>
    </div>
  );
}

// ── Add Transaction Modal ──────────────────────────────────────────────────
function AddTransactionModal({
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

// ── Add Category Modal ─────────────────────────────────────────────────────
function AddCategoryModal({
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

        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-card2 rounded-xl px-4 py-3 text-fore text-sm border border-line focus:outline-none focus:border-acid placeholder:text-muted transition-colors"
        />

        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Icono
          </p>
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_OPTIONS.map((key) => {
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

  const { totalIngresos, totalGastos, saldo } = useMemo(() => {
    const totalIngresos = transactions
      .filter((t) => t.type === "ingreso")
      .reduce((s, t) => s + t.amount, 0);
    const totalGastos = transactions
      .filter((t) => t.type === "gasto")
      .reduce((s, t) => s + t.amount, 0);
    return { totalIngresos, totalGastos, saldo: totalIngresos - totalGastos };
  }, [transactions]);

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
