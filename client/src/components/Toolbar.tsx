"use client";

export type Tool = "pen" | "eraser" | "note" | "select";

const COLORS = [
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const SIZES = [2, 4, 8, 14];

interface ToolbarProps {
  tool: Tool;
  setTool: (t: Tool) => void;
  color: string;
  setColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  onClear: () => void;
  connectedUsers: number;
}

export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onClear,
  connectedUsers,
}: ToolbarProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-toolbar-bg border border-toolbar-border rounded-xl px-4 py-2.5 shadow-2xl">
      {/* Tools */}
      <div className="flex items-center gap-1">
        <ToolButton
          active={tool === "pen"}
          onClick={() => setTool("pen")}
          title="Pen (P)"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </ToolButton>
        <ToolButton
          active={tool === "eraser"}
          onClick={() => setTool("eraser")}
          title="Eraser (E)"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M20 20H7L3 16l9-9 8 8-4 5zM6.5 13.5L12 8" />
          </svg>
        </ToolButton>
        <ToolButton
          active={tool === "note"}
          onClick={() => setTool("note")}
          title="Sticky Note (N)"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </ToolButton>
      </div>

      <div className="w-px h-6 bg-toolbar-border" />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full transition-transform ${
              color === c ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-toolbar-border" />

      {/* Stroke size */}
      <div className="flex items-center gap-1">
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setStrokeWidth(s)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              strokeWidth === s
                ? "bg-accent/20 text-accent"
                : "hover:bg-white/5 text-gray-400"
            }`}
          >
            <div
              className="rounded-full bg-current"
              style={{ width: s + 2, height: s + 2 }}
            />
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-toolbar-border" />

      {/* Clear */}
      <button
        onClick={onClear}
        className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
      >
        Clear
      </button>

      <div className="w-px h-6 bg-toolbar-border" />

      {/* Connected users */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        {connectedUsers} online
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
        active
          ? "bg-accent/20 text-accent"
          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
