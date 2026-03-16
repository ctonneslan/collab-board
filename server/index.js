const http = require("http");
const { setupWSConnection } = require("y-websocket/bin/utils");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(200);
  res.end("Collab Board WebSocket Server");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log(`[connect] client joined (${wss.clients.size} total)`);
  setupWSConnection(ws, req);

  ws.on("close", () => {
    console.log(`[disconnect] client left (${wss.clients.size} total)`);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
