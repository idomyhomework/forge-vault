// ── Habit types ─────────────────────────────────────────────────────────────
export interface Habit {
  id: string;
  label: string;
  icon: string;
  color: string;
  accentHex: string;
  checks: boolean[];
}

export interface WeekRecord {
  weekStart: string; // ISO date string (Monday of that week)
  habits: Habit[];
}

// ── Finance types ────────────────────────────────────────────────────────────
export type TransactionType = "ingreso" | "gasto";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: string;
}

// ── Notes types ──────────────────────────────────────────────────────────────
export type NoteColor =
  | "fore"
  | "acid"
  | "muted"
  | "crimson"
  | "blue-acc"
  | "orange-acc"
  | "purple-acc";

export type NoteBlockType = "text" | "list";

export interface NoteBlock {
  id: string;
  type: NoteBlockType;
  color: NoteColor;
  content: string;
  items: string[];
}

export interface Note {
  id: string;
  title: string;
  blocks: NoteBlock[];
  createdAt: string;
}

// ── Navigation types ─────────────────────────────────────────────────────────
export type Tab = "habitos" | "finanzas" | "gym" | "ahorros" | "notas";
