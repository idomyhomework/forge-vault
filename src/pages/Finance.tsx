import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
import type { Transaction, Category, TransactionType } from "../types";

// ── Default categories ─────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: Category[] = [
  { id: "salario", name: "Salario", icon: "💰", type: "ingreso" },
  { id: "freelance", name: "Freelance", icon: "💻", type: "ingreso" },
  { id: "comida", name: "Comida", icon: "🍔", type: "gasto" },
  { id: "transporte", name: "Transporte", icon: "🚗", type: "gasto" },
  { id: "ocio", name: "Ocio", icon: "🎮", type: "gasto" },
  { id: "streaming", name: "Streaming", icon: "📺", type: "gasto" },
  { id: "salud", name: "Salud", icon: "🏥", type: "gasto" },
];

// ── Emoji options ────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = [
  "💰",
  "💻",
  "🍔",
  "🚗",
  "🎮",
  "📺",
  "🏥",
  "✈️",
  "🛒",
  "🎓",
  "💊",
  "🏋️",
  "☕",
  "🐶",
  "🎵",
  "🏠",
  "👕",
  "💡",
  "📱",
  "🎁",
];

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
    <div className="bg-[#1c1c2e] rounded-2xl p-3 flex flex-col gap-1 border border-white/5">
      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
      <div className="bg-[#16162a] rounded-3xl w-full max-w-sm p-5 border border-white/10 flex flex-col gap-4 mb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white">Nueva transacción</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {(["ingreso", "gasto"] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={`flex-1 py-2 text-xs font-bold capitalize transition-colors ${
                type === t
                  ? t === "ingreso"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-transparent text-slate-400"
              }`}
            >
              {t === "ingreso" ? "➕ Ingreso" : "➖ Gasto"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
            US$
          </span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#1c1c2e] rounded-xl pl-12 pr-4 py-3 text-white text-sm font-bold border border-white/10 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Description */}
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full bg-[#1c1c2e] rounded-xl px-4 py-3 text-white text-sm border border-white/10 focus:outline-none focus:border-red-500 placeholder:text-slate-600"
        />

        {/* Category grid */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Categoría
          </p>
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`rounded-xl py-2 px-1 flex flex-col items-center gap-1 border text-xs font-semibold transition-all ${
                  categoryId === cat.id
                    ? "border-red-500 bg-red-500/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || !categoryId}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-2xl py-3 transition-all active:scale-95"
        >
          Añadir transacción
        </button>
      </div>
    </div>
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
  const [icon, setIcon] = useState("💰");
  const [type, setType] = useState<TransactionType>("gasto");

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
      <div className="bg-[#16162a] rounded-3xl w-full max-w-sm p-5 border border-white/10 flex flex-col gap-4 mb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white">Nueva categoría</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {(["ingreso", "gasto"] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 text-xs font-bold capitalize transition-colors ${
                type === t
                  ? t === "ingreso"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-transparent text-slate-400"
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
          className="w-full bg-[#1c1c2e] rounded-xl px-4 py-3 text-white text-sm border border-white/10 focus:outline-none focus:border-red-500 placeholder:text-slate-600"
        />

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Icono
          </p>
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                className={`text-lg rounded-lg p-1 transition-all ${
                  icon === e
                    ? "bg-red-500/20 ring-1 ring-red-500"
                    : "hover:bg-white/5"
                }`}
              >
                {e}
              </button>
            ))}
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
          className="bg-red-500 hover:bg-red-600 disabled:opacity-30 text-white font-black rounded-2xl py-3 transition-all active:scale-95"
        >
          Crear categoría
        </button>
      </div>
    </div>
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
          color={saldo >= 0 ? "text-white" : "text-red-400"}
        />
        <StatCard
          label="Ingresos"
          value={fmt(totalIngresos)}
          color="text-emerald-400"
        />
        <StatCard
          label="Gastos"
          value={fmt(totalGastos)}
          color="text-red-400"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddTx(true)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl py-3 text-sm transition-all active:scale-95"
        >
          + Transacción
        </button>
        <button
          onClick={() => setShowAddCat(true)}
          className="bg-[#1c1c2e] border border-white/10 text-slate-300 font-bold rounded-2xl px-4 py-3 text-sm hover:bg-white/5 transition-all active:scale-95"
        >
          + Categoría
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 bg-[#1c1c2e]">
        {(["all", "ingreso", "gasto"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${
              filterType === f
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {f === "all" ? "Todo" : f === "ingreso" ? "Ingresos" : "Gastos"}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-sm font-semibold">Sin transacciones aún</p>
          <p className="text-xs mt-1 text-slate-700">
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
                className="bg-[#1c1c2e] rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/5 group"
              >
                <span className="text-2xl">{cat?.icon ?? "💸"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {tx.description || cat?.name || "Transacción"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {cat?.name} ·{" "}
                    {new Date(tx.date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-sm font-black flex-shrink-0 ${
                    tx.type === "ingreso" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tx.type === "ingreso" ? "+" : "-"}
                  {fmt(tx.amount)}
                </span>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all ml-1 text-xl leading-none w-6 h-6 flex items-center justify-center flex-shrink-0"
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
        <div className="bg-[#1c1c2e] rounded-2xl px-4 py-3 border border-white/5 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {transactions.length} transacción
            {transactions.length !== 1 ? "es" : ""}
          </span>
          <span
            className={`text-xs font-black ${saldo >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            Balance: {saldo >= 0 ? "+" : ""}
            {saldo < 0 ? "-" : ""}
            {fmt(saldo)}
          </span>
        </div>
      )}

      {showAddTx && (
        <AddTransactionModal
          categories={categories}
          onAdd={addTransaction}
          onClose={() => setShowAddTx(false)}
        />
      )}
      {showAddCat && (
        <AddCategoryModal
          onAdd={addCategory}
          onClose={() => setShowAddCat(false)}
        />
      )}
    </div>
  );
}
