import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO === "true" || !process.env.NEXT_PUBLIC_WS_URL;

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

// Fake awareness for demo mode (no server needed)
class DemoAwareness {
  clientID = Math.floor(Math.random() * 1000000);
  private state: Record<string, unknown> = {};
  private listeners: Array<() => void> = [];

  setLocalStateField(key: string, value: unknown) {
    this.state[key] = value;
  }

  getStates() {
    const map = new Map();
    map.set(this.clientID, this.state);
    return map;
  }

  on(_event: string, fn: () => void) {
    this.listeners.push(fn);
  }

  off(_event: string, _fn: () => void) {
    // no-op
  }
}

export function initCollab(roomId: string) {
  if (_doc) return { doc: _doc, provider: _provider! };

  _doc = new Y.Doc();

  if (DEMO_MODE) {
    // Local-only mode: no server needed, full drawing works
    const fakeProvider = {
      awareness: new DemoAwareness(),
      disconnect: () => {},
    };
    _provider = fakeProvider as unknown as WebsocketProvider;
  } else {
    _provider = new WebsocketProvider(WS_URL, roomId, _doc);
  }

  return { doc: _doc, provider: _provider };
}

export function getStrokesArray(doc: Y.Doc): Y.Array<Stroke> {
  return doc.getArray<Stroke>("strokes");
}

export function getNotesArray(doc: Y.Doc): Y.Array<StickyNote> {
  return doc.getArray<StickyNote>("notes");
}

export function isDemo(): boolean {
  return DEMO_MODE;
}

export function cleanup() {
  _provider?.disconnect();
  _provider = null;
  _doc?.destroy();
  _doc = null;
}
