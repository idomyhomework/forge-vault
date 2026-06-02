import type { Category } from "../types";

// ── Default categories ────────────────────────────────────────────────────────
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "salario",    name: "Salario",    icon: "banknote",   type: "ingreso" },
  { id: "freelance",  name: "Freelance",  icon: "laptop",     type: "ingreso" },
  { id: "comida",     name: "Comida",     icon: "utensils",   type: "gasto"   },
  { id: "transporte", name: "Transporte", icon: "car",        type: "gasto"   },
  { id: "ocio",       name: "Ocio",       icon: "gamepad",    type: "gasto"   },
  { id: "streaming",  name: "Streaming",  icon: "tv",         type: "gasto"   },
  { id: "salud",      name: "Salud",      icon: "heartPulse", type: "gasto"   },
];
