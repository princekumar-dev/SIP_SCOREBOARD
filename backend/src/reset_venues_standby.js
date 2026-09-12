require("dotenv").config();
const { connectDb } = require("./db");
const Venue = require("./models/Venue");
const Tribe = require("./models/Tribe");
const User = require("./models/User");

const VENUE_PHYSICAL_HALLS = [
  { venueName: "Venue 1", location: "KRS Seminar Hall", hostEmail: "host1@msec.edu" },
  { venueName: "Venue 2", location: "ECE Seminar Hall", hostEmail: "host2@msec.edu" },
  { venueName: "Venue 3", location: "Civil Seminar Hall", hostEmail: "host3@msec.edu" },
  { venueName: "Venue 4", location: "MCW Seminar Hall", hostEmail: "host4@msec.edu" },
  { venueName: "Venue 5", location: "MS Auditorium", hostEmail: "host5@msec.edu" },
];

async function run() {
  await connectDb();
  console.log("Connected to MongoDB.");

  for (const item of VENUE_PHYSICAL_HALLS) {
    let venue = await Venue.findOne({
      $or: [{ venueName: item.venueName }, { location: item.location }],
    });

    if (!venue) {
      venue = new Venue({
        venueName: item.venueName,
        location: item.location,
        groupName: null,
        theme: "Pending Group Selection",
        motif: "neutral",
        participatingClasses: [],
        description: "Waiting for venue host to select and activate the currently present group.",
        isLocked: false,
      });
      await venue.save();
      console.log(`Created venue in standby: ${item.venueName} (${item.location})`);
    } else {
      venue.venueName = item.venueName;
      venue.location = item.location;
      venue.groupName = null;
      venue.theme = "Pending Group Selection";
      venue.motif = "neutral";
      venue.participatingClasses = [];
      venue.description = "Waiting for venue host to select and activate the currently present group.";
      await venue.save();
      console.log(`Reset venue to standby: ${item.venueName} (${item.location})`);
    }

    // Link user to physical venue
    if (item.hostEmail) {
      await User.updateOne(
        { email: item.hostEmail },
        { $set: { venueId: venue._id } }
      );
      console.log(`  Linked ${item.hostEmail} to ${item.location}`);
    }
  }

  // Clear venue assignments for all tribes until host activates group
  const tribeRes = await Tribe.updateMany({}, { $set: { venueId: null } });
  console.log(`Reset ${tribeRes.modifiedCount} tribes to unallocated venueId.`);

  console.log("All 5 venues successfully placed on standby awaiting host group selection!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error setting standby venues:", err);
  process.exit(1);
});
