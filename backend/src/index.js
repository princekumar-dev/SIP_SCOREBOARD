const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { connectDb } = require("./db");
const { port, clientOrigin, seedOnStart } = require("./config");
const { seedIfEmpty } = require("./seed");
const { attachIo } = require("./utils/realtime");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

async function start() {
  await connectDb();
  if (seedOnStart) {
    const result = await seedIfEmpty();
    if (result.seeded) console.log(`Seeded ${result.tribes} tribes across ${result.venues} venues`);
  }

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: clientOrigin, credentials: true },
  });
  attachIo(app, io);

  io.on("connection", (socket) => {
    socket.emit("scores:updated", { kind: "hello", at: new Date().toISOString() });
  });

  app.use(cors({ origin: clientOrigin, credentials: true }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "msec-sip-arena" }));
  app.use("/api/auth", authRoutes);
  app.use("/api", publicRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  });

  server.listen(port, () => {
    console.log(`SIP Arena API on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
