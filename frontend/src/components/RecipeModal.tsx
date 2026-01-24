import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export default function RecipeModal({ open, title, body, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  // סגירה בלחיצה על ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // פונקציה להעתקת המתכון
  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // פונקציה להדפסה מעוצבת
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>${title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              h1 { color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 10px; }
              .content { white-space: pre-wrap; font-size: 16px; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="content">${body}</div>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // 🎨 פונקציה חכמה שמפרמטת את הטקסט הגולמי ל-HTML מעוצב
  const renderStyledContent = (text: string) => {
    return text.split("\n").map((line, index) => {
      const cleanLine = line.trim();

      if (!cleanLine) return <div key={index} className="h-4" />; // רווח בין פסקאות

      // זיהוי כותרות (למשל: "מצרכים:", "הוראות הכנה:")
      // תנאי: מסתיים בנקודתיים או קצר מאוד ולא מתחיל במקף
      if (
        cleanLine.endsWith(":") ||
        (cleanLine.length < 30 && !cleanLine.startsWith("-") && !cleanLine.startsWith("*"))
      ) {
        return (
          <h3
            key={index}
            className="mt-6 mb-3 w-fit border-b border-amber-500/20 pb-1 text-lg font-bold text-amber-400"
          >
            {cleanLine}
          </h3>
        );
      }

      // זיהוי רשימות (שורות שמתחילות ב- או *)
      if (cleanLine.startsWith("-") || cleanLine.startsWith("*")) {
        return (
          <div key={index} className="group mb-2 flex items-start gap-3 pr-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 transition-colors group-hover:bg-amber-300" />
            <span className="leading-relaxed text-zinc-300 transition-colors group-hover:text-white">
              {cleanLine.replace(/^[-*]\s*/, "")}
            </span>
          </div>
        );
      }

      // טקסט רגיל
      return (
        <p key={index} className="mb-2 leading-relaxed text-zinc-300">
          {cleanLine}
        </p>
      );
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all duration-300"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        // כרטיס המודל הראשי
        className={[
          "relative flex w-full max-w-4xl flex-col",
          "max-h-[85vh]",
          "overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50",
          "animate-in zoom-in-95 fade-in duration-200", // אנימציית כניסה
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* --- Header מעוצב --- */}
        <div className="relative shrink-0 overflow-hidden border-b border-white/5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-5">
          {/* אפקט תאורה ברקע */}
          <div className="pointer-events-none absolute -mr-10 -mt-10 right-0 top-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            {/* צד ימין - כותרת */}
            <div className="min-w-0 flex-1 text-right" dir="rtl">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-2xl">🍳</span>
                <span className="text-xs font-medium uppercase tracking-wider text-amber-500">
                  מתכון חדש
                </span>
              </div>
              <h2 className="truncate text-2xl font-bold leading-tight text-white md:text-3xl">
                {title || "המתכון שלך"}
              </h2>
            </div>

            {/* צד שמאל - כפתורי פעולה */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="rounded-xl bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                title="הדפס מתכון"
              >
                🖨️
              </button>
              <button
                onClick={handleCopy}
                className="relative rounded-xl bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                title="העתק ללוח"
              >
                {copied ? "✅" : "📋"}
              </button>
              <div className="mx-1 h-8 w-px bg-white/10" /> {/* מפריד */}
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-red-500/20 hover:text-red-400"
                title="סגור"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* --- Content גוף המתכון --- */}
        <div
          className={[
            "flex-1 overflow-y-auto bg-zinc-950/50",
            "[&::-webkit-scrollbar]:w-2",
            "[&::-webkit-scrollbar-track]:bg-zinc-900",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-zinc-700",
            "hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600",
          ].join(" ")}
        >
          <div className="p-6 md:p-10" dir="rtl">
            <div className="text-base font-light leading-relaxed text-zinc-300 md:text-lg">
              {renderStyledContent(body)}
            </div>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/5 bg-zinc-900 px-6 py-4">
          <span className="hidden text-xs text-zinc-500 md:inline-block">
            נוצר על ידי השף הפרטי שלך 
          </span>
          <button
            onClick={onClose}
            className="transform rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-900/20 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-900/40"
          >
            בתאבון! (סגירה)
          </button>
        </div>
      </div>
    </div>
  );
}