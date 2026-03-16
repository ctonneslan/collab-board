import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

let _doc: Y.Doc | null = null;
let _provider: WebsocketProvider | null = null;

export interface Stroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  tool: string;
}

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface CursorInfo {
  x: number;
  y: number;
  name: string;
  color: string;
}

export function getRandomColor(): string {
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getRandomName(): string {
  const adjectives = [
    "Swift",
    "Bright",
    "Bold",
    "Calm",
    "Quick",
    "Warm",
    "Cool",
  ];
  const nouns = [
    "Fox",
    "Owl",
    "Bear",
    "Wolf",
    "Hawk",
    "Deer",
    "Lynx",
  ];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

export function initCollab(roomId: string) {
  if (_doc) return { doc: _doc, provider: _provider! };

  _doc = new Y.Doc();
  _provider = new WebsocketProvider(WS_URL, roomId, _doc);

  return { doc: _doc, provider: _provider };
}

export function getStrokesArray(doc: Y.Doc): Y.Array<Stroke> {
  return doc.getArray<Stroke>("strokes");
}

export function getNotesArray(doc: Y.Doc): Y.Array<StickyNote> {
  return doc.getArray<StickyNote>("notes");
}

export function cleanup() {
  _provider?.disconnect();
  _provider = null;
  _doc?.destroy();
  _doc = null;
}
