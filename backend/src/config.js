const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

module.exports = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/msec_sip_arena",
  jwtSecret: process.env.JWT_SECRET || "msec-sip-arena-dev-secret",
  clientOrigin: process.env.CLIENT_ORIGIN && process.env.CLIENT_ORIGIN.includes(",")
    ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim().replace(/\/+$/, ""))
    : (process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.trim().replace(/\/+$/, "") : "http://localhost:3000"),
  seedOnStart: String(process.env.SEED_ON_START || "false") === "true",
};
