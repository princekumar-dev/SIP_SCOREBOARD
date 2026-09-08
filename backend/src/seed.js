const bcrypt = require("bcryptjs");
const Venue = require("./models/Venue");
const Tribe = require("./models/Tribe");
const Member = require("./models/Member");
const Event = require("./models/Event");
const Score = require("./models/Score");
const User = require("./models/User");
const AuditLog = require("./models/AuditLog");

const VENUES = [
  {
    groupName: "Group I",
    venueName: "Venue 1",
    theme: "Creative & Design",
    location: "KRS Seminar Hall",
    motif: "creative",
    participatingClasses: ["AI & DS – A", "CSE – A", "Civil"],
    description: "Aesthetics, innovation, visual harmony, drafting and modern architectural concepts.",
  },
  {
    groupName: "Group II",
    venueName: "Venue 2",
    theme: "Technology & Innovation",
    location: "ECE Seminar Hall",
    motif: "tech",
    participatingClasses: ["Cyber Security", "AI & DS – B", "IT – A"],
    description: "Next-generation computation, algorithmic intelligence, cyber systems and digital transformation.",
  },
  {
    groupName: "Group III",
    venueName: "Venue 3",
    theme: "Space & Cosmic",
    location: "Civil Seminar Hall",
    motif: "space",
    participatingClasses: ["AI & ML", "IT – C", "EEE"],
    description: "Galactic exploration, cosmic navigation, stellar engineering and deep-space science.",
  },
  {
    groupName: "Group IV",
    venueName: "Venue 4",
    theme: "Legends & Mythology",
    location: "MCW Seminar Hall",
    motif: "legend",
    participatingClasses: ["ECE – A", "CSE – B", "MECH"],
    description: "Heroic leadership, classical mythology, valor, resilience and tactical wisdom.",
  },
  {
    groupName: "Group V",
    venueName: "Venue 5",
    theme: "Power & Energy",
    location: "MS Auditorium",
    motif: "energy",
    participatingClasses: ["ECE – B", "CSE – C", "IT – B"],
    description: "Electrical grid innovation, renewable power, atomic dynamism and sustainable energy.",
  },
];

const TRIBE_NAMES = [
  // Group I (Venue 1) - 18 curated teams
  [
    "Pixel Pioneers",
    "Design Dynamo",
    "Canvas Crafters",
    "Aesthetic Architects",
    "Vector Vanguard",
    "Palette Pulse",
    "Blueprint Builders",
    "Prism Prodigies",
    "Creative Catalysts",
    "Form & Function",
    "Vivid Visionaries",
    "Origami Ops",
    "Drafting Dynamos",
    "Spectrum Squad",
    "Fluid Framework",
    "Nexus Artisans",
    "Harmonic Horizons",
    "Kinetic Creators",
  ],
  // Group II (Venue 2) - 18 curated teams
  [
    "Byte Brigade",
    "Cyber Sentinels",
    "Quantum Quarks",
    "Neural Knights",
    "Code Crafters",
    "Silicon Syndicate",
    "Algorithmic Aces",
    "Digital Disruptors",
    "Logic Lords",
    "Cipher Crew",
    "Future Forge",
    "Tech Titans",
    "Matrix Mavens",
    "Binary Blitz",
    "Innovation Instigators",
    "Kernel Kings",
    "Data Drifters",
    "Apex Automators",
  ],
  // Group III (Venue 3) - 18 curated teams
  [
    "Orion Voyagers",
    "Cosmic Crusaders",
    "Astral Aces",
    "Stellar Syndicate",
    "Nebula Navigators",
    "Galactic Guardians",
    "Supernova Squad",
    "Pulsar Pioneers",
    "Apollo Aviators",
    "Zenith Zephyrs",
    "Celestial Centurions",
    "Solaris Seekers",
    "Eclipse Enforcers",
    "Vanguard Voyagers",
    "Cosmo Crafters",
    "Quasar Questers",
    "Milky Way Mavericks",
    "Astro Arc",
  ],
  // Group IV (Venue 4) - 18 curated teams
  [
    "Phoenix Legion",
    "Titan Vanguard",
    "Valkyrie Vanguard",
    "Spartan Sentinels",
    "Olympian Order",
    "Dragonheart Clan",
    "Griffin Guild",
    "Valhalla Voyagers",
    "Mythic Mavens",
    "Centaur Cohort",
    "Aegis Alliance",
    "Leviathan Lords",
    "Thunderbird Tribe",
    "Hydra Harbingers",
    "Samurai Syndicate",
    "Chimera Champions",
    "Colossus Corps",
    "Immortal Invicta",
  ],
  // Group V (Venue 5) - 18 curated teams
  [
    "Volt Vanguard",
    "Dynamo Dynasties",
    "Solaris Sparks",
    "Spark Syndicate",
    "Turbine Titans",
    "Fusion Force",
    "Current Crew",
    "Atomic Aces",
    "Grid Guardians",
    "Ampere Alliance",
    "Electra Elite",
    "Catalyst Charge",
    "Tesla Tribe",
    "Bio-Mass Brigade",
    "MegaWatt Mavens",
    "Kinetic Knights",
    "Power Pulse",
    "Terra Thermal",
  ],
];

const FIRST_NAMES = [
  "Aarav", "Diya", "Karthik", "Meera", "Rahul", "Sneha", "Vikram", "Ananya", "Hari", "Priya",
  "Siddharth", "Pooja", "Gautam", "Swathi", "Rohan", "Tanvi", "Aditya", "Keerthi", "Naveen", "Divya",
  "Varun", "Rhea", "Arjun", "Lakshmi", "Madhav", "Kavya", "Vishnu", "Shreya", "Surya", "Harini"
];

const LAST_NAMES = [
  "Iyer", "Krishnan", "Ramesh", "Nair", "Sharma", "Reddy", "Menon", "Das", "Pillai", "Kumar",
  "Venkatesh", "Balaji", "Subramanian", "Natarajan", "Sundaram", "Choudhury", "Patel", "Murugan", "Srinivasan", "Chandran"
];

const EVENTS = [
  { eventName: "Tear Down Lab", description: "Hands-on disassembly, component analysis and systems thinking.", maximumScore: 100 },
  { eventName: "Poster Presentation", description: "Visual storytelling and theme concept articulation.", maximumScore: 100 },
  { eventName: "Career Quest", description: "Career path discovery and professional agility readiness.", maximumScore: 100 },
  { eventName: "Sports", description: "Team synergy, athletic coordination and campus spirit.", maximumScore: 100 },
  { eventName: "Valedictory", description: "Closing showcase, presentation excellence and overall presence.", maximumScore: 100 },
];


async function seedDatabase({ force = false } = {}) {
  const existingCount = await Tribe.countDocuments();
  if (existingCount > 0 && !force) {
    return { seeded: false, tribes: existingCount };
  }

  // Clear existing collections if forcing or re-seeding
  await Promise.all([
    Venue.deleteMany({}),
    Tribe.deleteMany({}),
    Member.deleteMany({}),
    Event.deleteMany({}),
    Score.deleteMany({}),
    User.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const venues = await Venue.insertMany(VENUES);
  const events = await Event.insertMany(EVENTS);

  const tribes = [];
  let code = 1;
  venues.forEach((venue, venueIndex) => {
    TRIBE_NAMES[venueIndex].forEach((name) => {
      tribes.push({
        tribeCode: `SIP-${String(code).padStart(3, "0")}`,
        tribeName: name,
        groupName: venue.groupName,
        venueId: venue._id,
        theme: venue.theme,
        status: "active",
      });
      code += 1;
    });
  });
  const createdTribes = await Tribe.insertMany(tribes);

  // Generate 4-5 multidisciplinary members per tribe from the venue's participating classes
  const members = [];
  createdTribes.forEach((tribe, tribeIndex) => {
    const venueIndex = Math.floor(tribeIndex / 18);
    const classes = VENUES[venueIndex].participatingClasses;
    for (let i = 0; i < 4; i += 1) {
      const cls = classes[i % classes.length];
      const dept = cls.split("–")[0].trim().split(" ")[0];
      const firstName = FIRST_NAMES[(tribeIndex * 4 + i) % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(tribeIndex * 3 + i * 2) % LAST_NAMES.length];
      members.push({
        tribeId: tribe._id,
        name: `${firstName} ${lastName}`,
        department: dept,
        classSection: cls,
      });
    }
  });
  await Member.insertMany(members);

  // No demo/fake scores: scores start completely clean (0 / unentered)
  // and are updated live in real time as events are judged.

  // Setup initial users/hosts
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const hosts = venues.map((venue, index) => ({
    name: `${venue.location} Host`,
    email: `host${index + 1}@msec.edu`,
    passwordHash,
    role: "venue_host",
    venueId: venue._id,
    status: "active",
  }));

  await User.insertMany([
    {
      name: "SIP Super Admin",
      email: "admin@msec.edu",
      passwordHash,
      role: "super_admin",
      status: "active",
    },
    {
      name: "SIP Coordinator",
      email: "coordinator@msec.edu",
      passwordHash,
      role: "coordinator",
      venueId: venues[1]._id,
      status: "active",
    },
    ...hosts,
  ]);

  return { seeded: true, tribes: createdTribes.length, venues: venues.length };
}

async function seedIfEmpty() {
  return seedDatabase({ force: false });
}

module.exports = { seedDatabase, seedIfEmpty, VENUES, TRIBE_NAMES, EVENTS };
