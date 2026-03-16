"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import type { Tool } from "./Toolbar";
import type { Stroke, StickyNote } from "@/lib/collab";

interface CanvasProps {
  strokes: Y.Array<Stroke>;
  notes: Y.Array<StickyNote>;
  tool: Tool;
  color: string;
  strokeWidth: number;
  onCursorMove: (x: number, y: number) => void;
}

export default function Canvas({
  strokes,
  notes,
  tool,
  color,
  strokeWidth,
  onCursorMove,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<number[]>([]);
  const [localStrokes, setLocalStrokes] = useState<Stroke[]>([]);
  const [localNotes, setLocalNotes] = useState<StickyNote[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const animFrameRef = useRef<number>(0);

  // Sync Y.js strokes to local state
  useEffect(() => {
    const update = () => setLocalStrokes(strokes.toArray());
    update();
    strokes.observe(update);
    return () => strokes.unobserve(update);
  }, [strokes]);

  // Sync Y.js notes to local state
  useEffect(() => {
    const update = () => setLocalNotes(notes.toArray());
    update();
    notes.observe(update);
    return () => notes.unobserve(update);
  }, [notes]);

  // Draw everything
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dot grid
    ctx.fillStyle = "#2a2a2a";
    for (let x = 0; x < canvas.width; x += 30) {
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw strokes
    for (const stroke of localStrokes) {
      drawStroke(ctx, stroke);
    }

    // Draw current in-progress stroke
    if (isDrawing && currentStrokeRef.current.length >= 4) {
      drawStroke(ctx, {
        id: "current",
        points: currentStrokeRef.current,
        color: tool === "eraser" ? "#1a1a1a" : color,
        width: tool === "eraser" ? 20 : strokeWidth,
        tool,
      });
    }
  }, [localStrokes, isDrawing, color, strokeWidth, tool]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 4) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(stroke.points[0], stroke.points[1]);

    for (let i = 2; i < stroke.points.length - 2; i += 2) {
      const xc = (stroke.points[i] + stroke.points[i + 2]) / 2;
      const yc = (stroke.points[i + 1] + stroke.points[i + 3]) / 2;
      ctx.quadraticCurveTo(stroke.points[i], stroke.points[i + 1], xc, yc);
    }

    const last = stroke.points.length;
    ctx.lineTo(stroke.points[last - 2], stroke.points[last - 1]);
    ctx.stroke();
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool === "note") {
      const newNote: StickyNote = {
        id: crypto.randomUUID(),
        x: e.clientX - 75,
        y: e.clientY - 50,
        text: "",
        color: color === "#ffffff" ? "#eab308" : color,
      };
      notes.push([newNote]);
      setEditingNote(newNote.id);
      return;
    }

    setIsDrawing(true);
    currentStrokeRef.current = [e.clientX, e.clientY];
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    onCursorMove(e.clientX, e.clientY);

    if (!isDrawing) return;

    currentStrokeRef.current.push(e.clientX, e.clientY);

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(draw);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length >= 4) {
      const newStroke: Stroke = {
        id: crypto.randomUUID(),
        points: [...currentStrokeRef.current],
        color: tool === "eraser" ? "#1a1a1a" : color,
        width: tool === "eraser" ? 20 : strokeWidth,
        tool,
      };
      strokes.push([newStroke]);
    }

    currentStrokeRef.current = [];
    draw();
  };

  const handleNoteChange = (id: string, text: string) => {
    const arr = notes.toArray();
    const idx = arr.findIndex((n) => n.id === id);
    if (idx !== -1) {
      const updated = { ...arr[idx], text };
      notes.delete(idx, 1);
      notes.insert(idx, [updated]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (editingNote) return;
      if (e.key === "p") document.dispatchEvent(new CustomEvent("tool", { detail: "pen" }));
      if (e.key === "e") document.dispatchEvent(new CustomEvent("tool", { detail: "eraser" }));
      if (e.key === "n") document.dispatchEvent(new CustomEvent("tool", { detail: "note" }));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editingNote]);

  return (
    <div className="relative w-screen h-screen">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Sticky notes overlay */}
      {localNotes.map((note) => (
        <div
          key={note.id}
          className="absolute shadow-xl rounded-lg overflow-hidden"
          style={{
            left: note.x,
            top: note.y,
            width: 150,
            minHeight: 100,
            zIndex: 30,
          }}
        >
          <div
            className="h-6 cursor-move"
            style={{ backgroundColor: note.color }}
          />
          <textarea
            className="w-full h-full min-h-[76px] p-2 text-sm text-black bg-white/90 resize-none focus:outline-none"
            value={note.text}
            placeholder="Type here..."
            autoFocus={editingNote === note.id}
            onChange={(e) => handleNoteChange(note.id, e.target.value)}
            onFocus={() => setEditingNote(note.id)}
            onBlur={() => setEditingNote(null)}
          />
        </div>
      ))}
    </div>
  );
}
