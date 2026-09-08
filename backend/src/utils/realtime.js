function attachIo(app, io) {
  app.set("io", io);
}

function broadcast(req, payload = {}) {
  const io = req.app.get("io");
  if (io) io.emit("scores:updated", { ...payload, at: new Date().toISOString() });
}

module.exports = { attachIo, broadcast };
