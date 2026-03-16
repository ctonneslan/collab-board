# Collab Board

A real-time collaborative whiteboard where multiple users can draw, add sticky notes, and see each other's cursors live. Built on CRDTs for conflict-free synchronization.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Y.js](https://img.shields.io/badge/Y.js-CRDTs-green)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-orange)

## Why This Exists

Real-time collaboration is one of the hardest problems in frontend engineering. This project demonstrates conflict-free replicated data types (CRDTs) via Y.js, WebSocket-based state synchronization, cursor presence awareness, and performant canvas rendering, all the pieces that power tools like Figma, Miro, and Notion.

## Architecture

```
┌──────────────────────────┐     ┌─────────────────────────┐
│     Client A (Next.js)   │     │     Client B (Next.js)  │
│                          │     │                         │
│  Canvas + Y.js Doc ◄─────┼─ws──┼──────► Canvas + Y.js Doc│
│  • Drawing engine        │     │  • Drawing engine       │
│  • Sticky notes          │     │  • Sticky notes         │
│  • Cursor awareness      │     │  • Cursor awareness     │
└──────────┬───────────────┘     └──────────┬──────────────┘
           │                                │
           └───────────► ws ◄───────────────┘
                         │
              ┌──────────┴──────────┐
              │  Y-WebSocket Server │
              │  • Doc persistence  │
              │  • State sync       │
              │  • Awareness relay  │
              └─────────────────────┘
```

## Features

- **Freehand drawing** with pen tool, smooth quadratic curve rendering
- **Eraser tool** for removing strokes
- **Sticky notes** that are synced across all users in real-time
- **Live cursors** showing where every connected user is pointing, with name tags and colors
- **Presence indicators** showing how many users are online
- **Color picker** with 8 preset colors
- **Adjustable stroke width** (4 sizes)
- **Keyboard shortcuts** (P = pen, E = eraser, N = note)
- **Room-based collaboration** via URL query parameter (`?room=my-room`)
- **Conflict-free sync** via Y.js CRDTs, no merge conflicts ever
- **Dot grid background** for spatial orientation

## How CRDTs Work Here

Y.js implements CRDTs (Conflict-free Replicated Data Types) which allow multiple users to edit the same data structure simultaneously without conflicts. Each client maintains a local copy of the Y.Doc, and Y.js handles merging changes automatically:

- **Y.Array<Stroke>**: Stores all drawing strokes. Concurrent additions are merged without conflicts.
- **Y.Array<StickyNote>**: Stores sticky notes with position and text.
- **Awareness Protocol**: Broadcasts ephemeral state (cursor positions, user info) that doesn't persist in the document.

This means users can draw simultaneously on the same canvas and every stroke appears on every screen without any central coordination or conflict resolution logic.

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | Next.js 15 + Tailwind CSS | Modern React with SSR/static optimization |
| Canvas | HTML5 Canvas API | High-performance 2D rendering |
| CRDT Engine | Y.js | Battle-tested CRDT library used by Notion, Tiptap |
| Real-time Transport | y-websocket | Y.js WebSocket provider with built-in persistence |
| Server | Node.js + ws | Lightweight WebSocket relay |

## Quick Start

### 1. Clone

```bash
git clone https://github.com/ctonneslan/collab-board.git
cd collab-board
```

### 2. Start the WebSocket server

```bash
cd server
npm install
node index.js
```

Server runs at `ws://localhost:4000`.

### 3. Start the client

```bash
cd client
npm install
npm run dev
```

Client runs at http://localhost:3000.

### 4. Collaborate

Open http://localhost:3000 in two browser tabs (or on two devices on the same network). Draw in one tab and watch it appear in the other. Cursors and sticky notes sync in real-time.

Use `?room=my-room-name` to create separate collaboration rooms.

## Project Structure

```
collab-board/
├── server/
│   ├── index.js          # WebSocket server with Y.js integration
│   └── package.json
├── client/
│   ├── src/
│   │   ├── app/          # Next.js app router
│   │   ├── components/
│   │   │   ├── Board.tsx     # Main board orchestrator + Y.js setup
│   │   │   ├── Canvas.tsx    # HTML5 Canvas drawing engine
│   │   │   ├── Toolbar.tsx   # Tool, color, and size selection
│   │   │   └── Cursors.tsx   # Live cursor rendering
│   │   └── lib/
│   │       └── collab.ts     # Y.js doc, provider, and type definitions
│   └── package.json
└── README.md
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| P | Pen tool |
| E | Eraser tool |
| N | Sticky note tool |

## License

MIT
