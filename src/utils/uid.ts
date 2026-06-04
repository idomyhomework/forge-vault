// ── UID generator ─────────────────────────────────────────────────────────────
// Uses crypto.randomUUID() for collision-resistant IDs, matching the gym module.
export function uid(): string {
  return crypto.randomUUID();
}
