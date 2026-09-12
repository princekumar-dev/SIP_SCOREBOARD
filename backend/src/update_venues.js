require("dotenv").config();
const { connectDb } = require("./db");
const Venue = require("./models/Venue");
const Tribe = require("./models/Tribe");
const User = require("./models/User");
const { GROUP_MAP } = require("./constants/groups");

const VENUE_DEFAULTS = [
  {
    venueName: "Venue 1",
    location: "KRS Seminar Hall",
    groupName: "Group I",
    theme: "Creative & Design",
    motif: "creative",
    participatingClasses: ["AI & DS – A", "CSE – A", "Civil"],
    description: "Aesthetics, innovation, visual harmony, drafting and modern architectural concepts.",
    hostEmail: "host1@msec.edu",
  },
  {
    venueName: "Venue 2",
    location: "ECE Seminar Hall",
    groupName: "Group II",
    theme: "Technology & Innovation",
    motif: "technology",
    participatingClasses: ["Cyber Security", "AI & DS – B", "IT – A"],
    description: "Next-generation computation, algorithmic intelligence, cyber systems and digital transformation.",
    hostEmail: "host2@msec.edu",
  },
  {
    venueName: "Venue 3",
    location: "Civil Seminar Hall",
    groupName: "Group III",
    theme: "Space & Cosmic",
    motif: "space",
    participatingClasses: ["AI & ML", "IT – C", "EEE"],
    description: "Galactic exploration, cosmic navigation, stellar engineering and deep-space science.",
    hostEmail: "host3@msec.edu",
  },
  {
    venueName: "Venue 4",
    location: "MCW Seminar Hall",
    groupName: "Group IV",
    theme: "Legends & Mythology",
    motif: "legends",
    participatingClasses: ["ECE – A", "CSE – B", "MECH"],
    description: "Ancient heritage, timeless epics, mythical prowess, and storied folklore reimagined.",
    hostEmail: "host4@msec.edu",
  },
  {
    venueName: "Venue 5",
    location: "MS Auditorium",
    groupName: "Group V",
    theme: "Power & Energy",
    motif: "power",
    participatingClasses: ["ECE – B", "CSE – C", "IT – B"],
    description: "Electrical grid innovation, renewable power, atomic dynamism and sustainable energy.",
    hostEmail: "host5@msec.edu",
  },
];

async function run() {
  await connectDb();
  console.log("Connected to MongoDB.");

  for (const def of VENUE_DEFAULTS) {
    let venue = await Venue.findOne({
      $or: [{ venueName: def.venueName }, { location: def.location }],
    });

    if (!venue) {
      venue = new Venue({
        venueName: def.venueName,
        location: def.location,
        groupName: def.groupName,
        theme: def.theme,
        motif: def.motif,
        participatingClasses: def.participatingClasses,
        description: def.description,
        isLocked: false,
      });
      await venue.save();
      console.log(`Created venue: ${def.venueName} (${def.location})`);
    } else {
      venue.venueName = def.venueName;
      venue.location = def.location;
      venue.groupName = def.groupName;
      venue.theme = def.theme;
      venue.motif = def.motif;
      venue.participatingClasses = def.participatingClasses;
      venue.description = def.description;
      await venue.save();
      console.log(`Updated venue: ${def.venueName} (${def.location}) -> ${def.groupName} - ${def.theme}`);
    }

    // Update tribes for this group
    const tribeRes = await Tribe.updateMany(
      { groupName: def.groupName },
      { $set: { venueId: venue._id } }
    );
    console.log(`  Synced ${tribeRes.modifiedCount} tribes for ${def.groupName} to ${venue.location}`);

    // Update Host user
    if (def.hostEmail) {
      await User.updateOne(
        { email: def.hostEmail },
        { $set: { venueId: venue._id } }
      );
      console.log(`  Linked ${def.hostEmail} to ${def.location}`);
    }
  }

  console.log("All 5 Venues and Groups perfectly synchronized!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error updating venues:", err);
  process.exit(1);
});
