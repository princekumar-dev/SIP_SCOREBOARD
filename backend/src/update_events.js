require("dotenv").config();
const { connectDb } = require("./db");
const Event = require("./models/Event");
const Score = require("./models/Score");

const TARGET_EVENTS = [
  {
    eventName: "Tear Down Lab",
    description: "Hands-on disassembly, component analysis and systems thinking.",
    maximumScore: 100,
    status: "active",
  },
  {
    eventName: "Poster Presentation",
    description: "Visual storytelling and theme concept articulation.",
    maximumScore: 100,
    status: "active",
  },
  {
    eventName: "Problem Hunt",
    description: "Problem-solving challenge and critical thinking assessment.",
    maximumScore: 100,
    status: "active",
  },
];

async function run() {
  await connectDb();
  console.log("Connected to MongoDB.");

  const targetNames = TARGET_EVENTS.map((e) => e.eventName);

  // Delete any events not in target list
  const extraEvents = await Event.find({ eventName: { $nin: targetNames } });
  if (extraEvents.length > 0) {
    const extraIds = extraEvents.map((e) => e._id);
    await Score.deleteMany({ eventId: { $in: extraIds } });
    await Event.deleteMany({ _id: { $in: extraIds } });
    console.log(`Deleted ${extraEvents.length} extra events:`, extraEvents.map((e) => e.eventName));
  }

  // Create or update the 3 target events
  for (const t of TARGET_EVENTS) {
    let existing = await Event.findOne({ eventName: t.eventName });
    if (existing) {
      existing.description = t.description;
      existing.maximumScore = t.maximumScore;
      existing.status = t.status;
      await existing.save();
      console.log(`Updated event: ${t.eventName} (Max ${t.maximumScore} pts, status: ${t.status})`);
    } else {
      await Event.create(t);
      console.log(`Created event: ${t.eventName} (Max ${t.maximumScore} pts, status: ${t.status})`);
    }
  }

  const finalEvents = await Event.find().sort({ createdAt: 1 });
  console.log("\nCurrent Active Events in Database:");
  finalEvents.forEach((e, idx) => {
    console.log(`${idx + 1}. ${e.eventName} - Max ${e.maximumScore} pts (${e.status})`);
  });

  process.exit(0);
}

run().catch((err) => {
  console.error("Error updating events:", err);
  process.exit(1);
});
