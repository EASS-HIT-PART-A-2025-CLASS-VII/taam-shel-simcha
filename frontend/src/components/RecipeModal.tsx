import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  body: string; // כל הטקסט של המתכון (reply)
  onClose: () => void;
};

export default function RecipeModal({ open, title, body, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={[
          "w-full max-w-6xl", // גדול
          "max-h-[85vh] overflow-hidden",
          "rounded-3xl border border-white/10 bg-zinc-950 text-white shadow-2xl",
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="min-w-0" dir="rtl">
            <h2 className="truncate text-xl md:text-2xl font-bold">
              {title || "המתכון שלך"}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Esc לסגירה · לחיצה מחוץ לחלון לסגירה
            </p>
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition"
            aria-label="סגור"
            title="סגור"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(85vh-64px-72px)] overflow-y-auto px-6 py-6">
          <div
            dir="rtl"
            className="whitespace-pre-wrap text-base md:text-lg leading-7 md:leading-8 text-white/90"
          >
            {body}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white/90 transition"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
