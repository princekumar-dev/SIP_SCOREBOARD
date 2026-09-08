const dns = require("dns");
const mongoose = require("mongoose");
const { mongoUri } = require("./config");

async function connectDb() {
  mongoose.set("strictQuery", true);
  if (mongoUri && mongoUri.startsWith("mongodb+srv://")) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (_) {}
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    const maskedUri = mongoUri.includes("@")
      ? mongoUri.replace(/\/\/[^@]+@/, "//***:***@")
      : mongoUri;
    console.log("MongoDB connected:", maskedUri);
    return;
  } catch (error) {
    console.warn("Target MongoDB not reachable, starting in-memory MongoDB...", error.message);
  }

  const { MongoMemoryServer } = require("mongodb-memory-server");
  const memory = await MongoMemoryServer.create();
  const uri = memory.getUri();
  await mongoose.connect(uri);
  console.log("In-memory MongoDB connected");
}

module.exports = { connectDb };
