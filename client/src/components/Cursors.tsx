"use client";

import type { CursorInfo } from "@/lib/collab";

interface CursorsProps {
  cursors: Map<string, CursorInfo>;
}

export default function Cursors({ cursors }: CursorsProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {Array.from(cursors.entries()).map(([id, cursor]) => (
        <div
          key={id}
          className="absolute transition-all duration-75"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-2px, -2px)",
          }}
        >
          {/* Cursor arrow */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill={cursor.color}
            className="drop-shadow-lg"
          >
            <path d="M0 0 L0 16 L4.5 12 L8.5 19 L11 18 L7 11 L13 11 Z" />
          </svg>
          {/* Name tag */}
          <div
            className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap shadow-lg"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}
