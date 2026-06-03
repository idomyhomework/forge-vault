import { useState, useMemo } from "react";
import { ArrowLeft, Trash2, Search, NotebookText } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
import { uid } from "../utils/uid";
import { COLORS, COLOR_HEX } from "../utils/noteConstants";
import type { Note, NoteBlock, NoteColor } from "../types";

function makeTextBlock(): NoteBlock {
  return { id: uid(), type: "text", color: "fore", content: "", items: [] };
}

function makeListBlock(): NoteBlock {
  return { id: uid(), type: "list", color: "fore", content: "", items: [""] };
}

// ── Block preview (list view card) ────────────────────────────────────────────
function BlockPreview({ block }: { block: NoteBlock }) {
  if (block.type === "text") {
    return (
      <p
        className="text-sm leading-relaxed line-clamp-2"
        style={{ color: COLOR_HEX[block.color] }}
      >
        {block.content || "—"}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {block.items.slice(0, 3).map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-1.5 text-sm"
          style={{ color: COLOR_HEX[block.color] }}
        >
          <span className="flex-shrink-0 mt-0.5" style={{ color: "#8b8b9a" }}>
            •
          </span>
          <span className="line-clamp-1">{item || "—"}</span>
        </li>
      ))}
      {block.items.length > 3 && (
        <li className="text-xs" style={{ color: "#8b8b9a" }}>
          +{block.items.length - 3} más…
        </li>
      )}
    </ul>
  );
}

// ── Block editor ──────────────────────────────────────────────────────────────
function BlockEditor({
  block,
  onChange,
  onDelete,
}: {
  block: NoteBlock;
  onChange: (updated: NoteBlock) => void;
  onDelete: () => void;
}) {
  // ── Block mutations ────────────────────────────────────────────────────────
  const setColor = (color: NoteColor) => onChange({ ...block, color });
  const setContent = (content: string) => onChange({ ...block, content });
  const setItem = (i: number, val: string) =>
    onChange({
      ...block,
      items: block.items.map((it, idx) => (idx === i ? val : it)),
    });
  const addItem = () => onChange({ ...block, items: [...block.items, ""] });
  const removeItem = (i: number) =>
    onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) });

  return (
    <div className="bg-card2 rounded-2xl border border-line p-3 flex flex-col gap-2.5">
      {/* Content area */}
      {block.type === "text" ? (
        <textarea
          value={block.content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe aquí..."
          rows={3}
          className="w-full bg-transparent resize-none text-sm leading-relaxed focus:outline-none placeholder-muted"
          style={{ color: COLOR_HEX[block.color] }}
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="text-sm flex-shrink-0"
                style={{ color: "#8b8b9a" }}
              >
                •
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(i, e.target.value)}
                placeholder="Elemento..."
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder-muted"
                style={{ color: COLOR_HEX[block.color] }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                  if (
                    e.key === "Backspace" &&
                    !item &&
                    block.items.length > 1
                  ) {
                    e.preventDefault();
                    removeItem(i);
                  }
                }}
              />
              {block.items.length > 1 && (
                <button
                  onClick={() => removeItem(i)}
                  className="text-muted hover:text-crimson text-sm leading-none transition-colors flex-shrink-0"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addItem}
            className="text-left font-mono text-[10px] uppercase tracking-widest text-muted hover:text-fore transition-colors mt-0.5"
          >
            + Añadir elemento
          </button>
        </div>
      )}

      {/* Footer: type label + color picker + delete */}
      <div className="flex items-center gap-2 pt-1.5 border-t border-line">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted flex-shrink-0">
          {block.type === "text" ? "Txt" : "List"}
        </span>
        <div className="flex items-center gap-1.5 flex-1 py-1">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className="w-3.5 h-3.5 mx-1 rounded-full flex-shrink-0 hover:scale-110 transition-transform"
              style={{
                backgroundColor: c.hex,
                boxShadow:
                  block.color === c.value
                    ? `0 0 0 2px #1c1c24, 0 0 0 3.5px ${c.hex}`
                    : undefined,
                transform: block.color === c.value ? "scale(1.25)" : undefined,
              }}
            />
          ))}
        </div>
        <button
          onClick={onDelete}
          className="text-muted hover:text-crimson transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Note detail view ──────────────────────────────────────────────────────────
function NoteDetail({
  note,
  onUpdate,
  onDelete,
  onBack,
}: {
  note: Note;
  onUpdate: (updated: Note) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Note mutations ────────────────────────────────────────────────────────
  const setTitle = (title: string) => onUpdate({ ...note, title });
  const addBlock = (type: "text" | "list") =>
    onUpdate({
      ...note,
      blocks: [
        ...note.blocks,
        type === "text" ? makeTextBlock() : makeListBlock(),
      ],
    });
  const updateBlock = (id: string, updated: NoteBlock) =>
    onUpdate({
      ...note,
      blocks: note.blocks.map((b) => (b.id === id ? updated : b)),
    });
  const deleteBlock = (id: string) =>
    onUpdate({ ...note, blocks: note.blocks.filter((b) => b.id !== id) });

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-fore transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Notas
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted">¿Eliminar?</span>
            <button
              onClick={onDelete}
              className="font-mono text-xs font-bold text-crimson hover:text-crimson/80 transition-colors"
            >
              Sí
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="font-mono text-xs text-muted hover:text-fore transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-crimson transition-colors"
          >
            Eliminar nota
          </button>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        value={note.title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título..."
        className="w-full bg-transparent font-display text-xl uppercase tracking-wide text-fore focus:outline-none placeholder-muted border-b border-line pb-2"
      />

      {/* Blocks */}
      <div className="flex flex-col gap-3">
        {note.blocks.map((block) => (
          <BlockEditor
            key={block.id}
            block={block}
            onChange={(updated) => updateBlock(block.id, updated)}
            onDelete={() => deleteBlock(block.id)}
          />
        ))}
        {note.blocks.length === 0 && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted text-center py-8">
            Sin bloques — añade texto o una lista abajo
          </p>
        )}
      </div>

      {/* Add block toolbar */}
      <div className="flex gap-2 pt-2 border-t border-line">
        <button
          onClick={() => addBlock("text")}
          className="flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-fore bg-card2 border border-line hover:border-acid transition-colors"
        >
          + Texto
        </button>
        <button
          onClick={() => addBlock("list")}
          className="flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-fore bg-card2 border border-line hover:border-acid transition-colors"
        >
          + Lista
        </button>
      </div>
    </div>
  );
}

// ── Notes page ────────────────────────────────────────────────────────────────
export default function Notes() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEYS.notes, []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      if (n.title.toLowerCase().includes(q)) return true;
      return n.blocks.some((b) =>
        b.type === "text"
          ? b.content.toLowerCase().includes(q)
          : b.items.some((item) => item.toLowerCase().includes(q)),
      );
    });
  }, [notes, query]);

  // ── Note operations ───────────────────────────────────────────────────────
  const createNote = () => {
    const newNote: Note = {
      id: uid(),
      title: "",
      blocks: [],
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setOpenId(newNote.id);
  };

  const updateNote = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setOpenId(null);
  };

  // ── Detail view ───────────────────────────────────────────────────────────
  if (openId !== null) {
    const note = notes.find((n) => n.id === openId);
    if (!note) return null;
    return (
      <NoteDetail
        note={note}
        onUpdate={updateNote}
        onDelete={() => deleteNote(openId)}
        onBack={() => setOpenId(null)}
      />
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {notes.length} {notes.length === 1 ? "nota" : "notas"}
        </span>
        <button
          onClick={createNote}
          className="flex items-center gap-1 bg-card2 border border-line hover:border-acid rounded-xl px-3 py-1.5 font-mono text-xs text-fore transition-colors"
        >
          + Nueva nota
        </button>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar notas..."
          className="w-full bg-card2 border border-line rounded-xl pl-8 pr-3 py-2 text-sm text-fore placeholder-muted focus:outline-none focus:border-acid transition-colors"
        />
      </div>

      <div className="h-px bg-line" />

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <NotebookText
            className="w-12 h-12 opacity-20 text-muted"
            strokeWidth={1}
          />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Sin notas aún
          </p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Sin resultados para "{query}"
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setOpenId(note.id)}
              className="w-full text-left bg-card rounded-2xl border border-line hover:border-acid/50 p-4 flex flex-col gap-2 transition-all active:scale-[0.99]"
            >
              <span className="font-display text-sm uppercase tracking-wide text-fore truncate">
                {note.title || "Sin título"}
              </span>
              {note.blocks.length > 0 && (
                <div className="opacity-70">
                  <BlockPreview block={note.blocks[0]} />
                </div>
              )}
              <span className="font-mono text-[10px] text-muted">
                {new Date(note.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
