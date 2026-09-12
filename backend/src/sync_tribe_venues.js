const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {}
const mongoose = require("mongoose");
const { mongoUri } = require("./config");
const Venue = require("./models/Venue");
const Tribe = require("./models/Tribe");

async function syncTribeVenues() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const venues = await Venue.find().lean();
  console.log("Current Venues in DB:");
  const activeGroups = new Set();
  
  for (const v of venues) {
    console.log(`- ${v.venueName} (${v.location}): groupName = ${v.groupName || "null"}`);
    if (v.groupName) {
      activeGroups.add(v.groupName);
      const res = await Tribe.updateMany(
        { groupName: v.groupName },
        { $set: { venueId: v._id } }
      );
      console.log(`  -> Assigned ${res.modifiedCount} tribes in ${v.groupName} to venue ${v.venueName} (${v.location})`);
    }
  }

  // Clear venueId for any tribe whose group is NOT currently assigned to a venue
  const clearRes = await Tribe.updateMany(
    { groupName: { $nin: Array.from(activeGroups) } },
    { $set: { venueId: null } }
  );
  console.log(`Cleared venueId for ${clearRes.modifiedCount} tribes in unallocated/standby groups.`);

  console.log("Tribe venue sync complete.");
  await mongoose.disconnect();
}

syncTribeVenues().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
