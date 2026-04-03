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

export type Tab = "habitos" | "finanzas" | "gym" | "ahorros";
