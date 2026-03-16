"use client";

import { useEffect, useRef, useState } from "react";
import {
  initCollab,
  getStrokesArray,
  getNotesArray,
  cleanup,
  getRandomColor,
  getRandomName,
  isDemo,
  type CursorInfo,
} from "@/lib/collab";
import type { Tool } from "./Toolbar";
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import Cursors from "./Cursors";

export default function Board() {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [cursors, setCursors] = useState<Map<string, CursorInfo>>(new Map());
  const [ready, setReady] = useState(false);

  const collabRef = useRef<ReturnType<typeof initCollab> | null>(null);
  const userRef = useRef({ name: "", color: "" });

  useEffect(() => {
    const roomId = new URLSearchParams(window.location.search).get("room") || "default-room";
    const { doc, provider } = initCollab(roomId);
    collabRef.current = { doc, provider };

    userRef.current = {
      name: getRandomName(),
      color: getRandomColor(),
    };

    // Set awareness (presence)
    provider.awareness.setLocalStateField("user", userRef.current);

    const updateUsers = () => {
      const states = provider.awareness.getStates();
      setConnectedUsers(states.size);

      const newCursors = new Map<string, CursorInfo>();
      states.forEach((state, clientId) => {
        if (clientId !== provider.awareness.clientID && state.cursor) {
          newCursors.set(String(clientId), {
            x: state.cursor.x,
            y: state.cursor.y,
            name: state.user?.name || "Anonymous",
            color: state.user?.color || "#888",
          });
        }
      });
      setCursors(newCursors);
    };

    provider.awareness.on("change", updateUsers);
    setReady(true);

    // Listen for keyboard shortcut events
    const handleToolEvent = (e: Event) => {
      setTool((e as CustomEvent).detail as Tool);
    };
    document.addEventListener("tool", handleToolEvent);

    return () => {
      document.removeEventListener("tool", handleToolEvent);
      cleanup();
    };
  }, []);

  const handleCursorMove = (x: number, y: number) => {
    if (!collabRef.current) return;
    collabRef.current.provider.awareness.setLocalStateField("cursor", { x, y });
  };

  const handleClear = () => {
    if (!collabRef.current) return;
    const strokes = getStrokesArray(collabRef.current.doc);
    const notes = getNotesArray(collabRef.current.doc);
    strokes.delete(0, strokes.length);
    notes.delete(0, notes.length);
  };

  if (!ready || !collabRef.current) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Connecting...
      </div>
    );
  }

  return (
    <>
      {isDemo() && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs px-4 py-2 rounded-lg">
          Demo mode: drawing works locally. Connect a WebSocket server for multi-user sync.
        </div>
      )}
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onClear={handleClear}
        connectedUsers={connectedUsers}
      />
      <Cursors cursors={cursors} />
      <Canvas
        strokes={getStrokesArray(collabRef.current.doc)}
        notes={getNotesArray(collabRef.current.doc)}
        tool={tool}
        color={color}
        strokeWidth={strokeWidth}
        onCursorMove={handleCursorMove}
      />
    </>
  );
}
