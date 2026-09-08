const { connectDb } = require("./db");
const User = require("./models/User");
const Venue = require("./models/Venue");

async function run() {
  await connectDb();
  const venues = await Venue.find();
  const venueMap = {};
  venues.forEach(v => { venueMap[v._id.toString()] = v; });

  const users = await User.find();
  for (const u of users) {
    if (u.venueId && venueMap[u.venueId.toString()]) {
      const v = venueMap[u.venueId.toString()];
      u.name = `${v.location} Host`;
      await u.save();
      console.log(`Updated user ${u.email} -> ${u.name}`);
    } else if (u.role === "super_admin") {
      u.name = "SIP Super Admin";
      await u.save();
      console.log(`Updated super admin ${u.email} -> ${u.name}`);
    }
  }
  process.exit(0);
}

run();
