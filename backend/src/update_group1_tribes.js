const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {}
const mongoose = require("mongoose");
const { mongoUri } = require("./config");
const Tribe = require("./models/Tribe");
const Member = require("./models/Member");
const Venue = require("./models/Venue");

const GROUP1_DATA = [
  {
    tribeName: "Vector Vanguard",
    members: [
      { name: "Harish. M", department: "AI & DS", classSection: "AIDS" },
      { name: "Gowtham. N", department: "AI & DS", classSection: "AIDS" },
      { name: "Dharanish. M", department: "AI & DS", classSection: "AIDS" },
      { name: "Mukesh Krishna", department: "AI & DS", classSection: "AIDS" },
      { name: "Tamilarasu. J", department: "Civil", classSection: "Civil" },
      { name: "Abiraj", department: "Civil", classSection: "Civil" },
      { name: "Manikandan", department: "Civil", classSection: "Civil" },
      { name: "Nithish", department: "Civil", classSection: "Civil" },
      { name: "Harish. S", department: "AI & DS", classSection: "AI/DS" },
      { name: "M. Mohamed Kasim", department: "AI & DS", classSection: "AI/DS" },
    ],
  },
  {
    tribeName: "Vivid Visionaries",
    aliases: ["VIVID VISIONARIES"],
    members: [
      { name: "Asgar Mehdi", department: "AI & DS", classSection: "AI/DS" },
      { name: "Moulish. E", department: "AI & DS", classSection: "AI/DS" },
      { name: "Madhan Kumar", department: "AI & DS", classSection: "AI/DS" },
      { name: "Kaniskan", department: "AI & DS", classSection: "AI/DS" },
      { name: "Kamalesh", department: "CSE", classSection: "CSE" },
      { name: "Hariharan. J", department: "CSE", classSection: "CSE" },
      { name: "Kamal", department: "CSE", classSection: "CSE" },
      { name: "Hari Kumar", department: "CSE", classSection: "CSE" },
      { name: "Rakesh", department: "Civil", classSection: "Civil" },
      { name: "Vishal Paul. M", department: "Civil", classSection: "Civil" },
    ],
  },
  {
    tribeName: "Origami Ops",
    members: [
      { name: "Anbu Chezhiyan. S", department: "Civil", classSection: "Civil" },
      { name: "Anbu Selvan. S", department: "Civil", classSection: "Civil" },
      { name: "Sam. M", department: "Civil", classSection: "Civil" },
      { name: "Bharath. S", department: "CSE", classSection: "CSE" },
      { name: "Paraniv. S", department: "Civil", classSection: "Civil" },
      { name: "Jithendra Kumar. R", department: "CSE", classSection: "CSE" },
      { name: "Vimal Raja. V", department: "Civil", classSection: "Civil" },
      { name: "Harshad. R", department: "CSE", classSection: "CSE" },
      { name: "Dharanidharan. V", department: "AI & DS", classSection: "AIDS" },
      { name: "Jeevan. D", department: "AI & DS", classSection: "AIDS" },
      { name: "Imtiha. K", department: "CSE", classSection: "CSE" },
    ],
  },
  {
    tribeName: "Kinetic Creations",
    aliases: ["Kinetic Creators"],
    members: [
      { name: "Deepesh. N", department: "Creative & Design", classSection: "Group I" },
      { name: "Kamaleshwar. G", department: "Creative & Design", classSection: "Group I" },
      { name: "Harish Snehan", department: "Creative & Design", classSection: "Group I" },
      { name: "Jeeva Prakash", department: "Creative & Design", classSection: "Group I" },
      { name: "Balamukesh. V", department: "Creative & Design", classSection: "Group I" },
      { name: "Harish Kumar", department: "Creative & Design", classSection: "Group I" },
      { name: "Deepan Saonathy", department: "Creative & Design", classSection: "Group I" },
      { name: "Gowtham", department: "Creative & Design", classSection: "Group I" },
      { name: "Dinesh", department: "Creative & Design", classSection: "Group I" },
      { name: "Harish Kumar", department: "Creative & Design", classSection: "Group I" },
    ],
  },
  {
    tribeName: "Spectrum Squad",
    members: [
      { name: "Abhinav. N", department: "Creative & Design", classSection: "Group I" },
      { name: "Shakid. S", department: "Creative & Design", classSection: "Group I" },
      { name: "Dinesh Karthikeyan. K", department: "Creative & Design", classSection: "Group I" },
      { name: "Harshavardhan. M", department: "Creative & Design", classSection: "Group I" },
      { name: "Dhanush. T", department: "Creative & Design", classSection: "Group I" },
    ],
  },
  {
    tribeName: "Vision Barv I",
    aliases: ["Creative Catalysts", "Form & Function", "Palette Pulse"],
    members: [
      { name: "Aaqil Hafeez. N", department: "CSE", classSection: "B.E CSE" },
      { name: "Janagan R.S", department: "CSE", classSection: "B.E CSE" },
      { name: "Gokul. G", department: "CSE", classSection: "B.E CSE" },
      { name: "Ashwin Krishna. V", department: "CSE", classSection: "B.E CSE" },
      { name: "Adnan A.R", department: "AI & DS", classSection: "AIDS" },
      { name: "Gokulnath", department: "AI & DS", classSection: "AIDS" },
      { name: "Abdullah. K", department: "AI & DS", classSection: "AIDS" },
      { name: "A. Hamed Faarish. M", department: "AI & DS", classSection: "AIDS" },
      { name: "Suriya Prakash. S", department: "Civil", classSection: "Civil" },
      { name: "Santhosh. K", department: "Civil", classSection: "Civil" },
    ],
  },
  {
    tribeName: "Nexus Artisans",
    members: [
      { name: "Yugesh", department: "Civil", classSection: "Civil" },
      { name: "Aufrash", department: "Civil", classSection: "Civil" },
      { name: "Dharani", department: "Civil", classSection: "Civil" },
      { name: "Sanjeevan", department: "Civil", classSection: "Civil" },
      { name: "Grauthan", department: "CSE", classSection: "CSE" },
      { name: "Bhuvaneshwaran", department: "CSE", classSection: "CSE" },
      { name: "E. Byelijah", department: "CSE", classSection: "CSE" },
      { name: "Kalvin Christopher", department: "AI & DS", classSection: "AI,DS" },
    ],
  },
  {
    tribeName: "Imaginex",
    aliases: ["Fluid Framework", "Canvas Crafters"],
    members: [
      { name: "Sanjay (Leader)", department: "Civil", classSection: "Civil" },
      { name: "Elantheeran", department: "CSE", classSection: "CSE" },
      { name: "Gokul", department: "CSE", classSection: "CSE" },
      { name: "Peter", department: "CSE", classSection: "CSE" },
      { name: "Sasi", department: "Civil", classSection: "Civil" },
      { name: "Rohit", department: "Civil", classSection: "Civil" },
      { name: "Sanjay Dharshan", department: "Civil", classSection: "Civil" },
      { name: "Lalith", department: "AI & DS", classSection: "AI/DS" },
      { name: "Imthiyaz", department: "AI & DS", classSection: "AI/DS" },
      { name: "Deepash", department: "CSE", classSection: "CSE" },
    ],
  },
  {
    tribeName: "Prism Prodigies",
    aliases: ["Parism Prodigies"],
    members: [
      { name: "Dharshini. S. G", department: "CSE", classSection: "CSE" },
      { name: "Elampirai Sakthi. V", department: "Civil", classSection: "Civil" },
      { name: "Apernaa Gayathri. A", department: "CSE", classSection: "CSE" },
      { name: "Shangavi. S", department: "Civil", classSection: "Civil" },
      { name: "Roobahasini. M", department: "Civil", classSection: "Civil" },
      { name: "Kirthika S", department: "AI & DS", classSection: "AI & DS" },
      { name: "Divya. V", department: "AI & DS", classSection: "AI & DS" },
      { name: "Magaleksmi. V", department: "Civil", classSection: "Civil" },
      { name: "Dhanushya. K", department: "AI & DS", classSection: "AI & DS" },
      { name: "Yashwantika. S", department: "Civil", classSection: "Civil" },
    ],
  },
  {
    tribeName: "Drafting Dynamos",
    members: [
      { name: "Harini. H", department: "CSE", classSection: "CSE A" },
      { name: "Monika. S", department: "AI & DS", classSection: "AIDS A" },
      { name: "Danyasree. N", department: "AI & DS", classSection: "AIDS A" },
      { name: "Akshaya. A", department: "AI & DS", classSection: "AIDS A" },
      { name: "Dhanashree. G", department: "CSE", classSection: "CSE A" },
      { name: "Hemaashree. V", department: "AI & DS", classSection: "AIDS A" },
      { name: "Ambreen Haniyah KM", department: "CSE", classSection: "CSE A" },
      { name: "Abinaya. S", department: "CSE", classSection: "CSE A" },
      { name: "Dhujasri. J", department: "AI & DS", classSection: "AIDS A" },
      { name: "Bavana. P", department: "AI & DS", classSection: "AIDS A" },
    ],
  },
  {
    tribeName: "Nexora",
    aliases: ["Harmonic Horizons"],
    members: [
      { name: "Darshinika. P", department: "CSE", classSection: "CSE" },
      { name: "Hemavathy. R", department: "CSE", classSection: "CSE" },
      { name: "Aarthika. B.M", department: "CSE", classSection: "CSE" },
      { name: "Gayathri. M", department: "CSE", classSection: "CSE" },
      { name: "Anugraha Pradaa. A.P", department: "CSE", classSection: "CSE" },
      { name: "Renuka Devi. K", department: "Civil", classSection: "Civil" },
      { name: "Monika. T", department: "AI & DS", classSection: "AIDS" },
      { name: "Divya. K", department: "Civil", classSection: "Civil" },
      { name: "Lajjana. R", department: "AI & DS", classSection: "AIDS" },
      { name: "Anushri. E", department: "Civil", classSection: "Civil" },
    ],
  },
  {
    tribeName: "Inventory Bubbles",
    aliases: ["Palette Pulse"],
    members: [
      { name: "Dhishya Nethra. R", department: "CSE", classSection: "CSE A" },
      { name: "Aafiya. K", department: "AI & DS", classSection: "AIDS A" },
      { name: "Charishma Golthi", department: "CSE", classSection: "CSE A" },
      { name: "Aysha Rifnath. A", department: "AI & DS", classSection: "AIDS A" },
      { name: "L. Hajika", department: "CSE", classSection: "CSE A" },
      { name: "Methula. P", department: "AI & DS", classSection: "AIDS A" },
      { name: "Jayalakshmi. B", department: "AI & DS", classSection: "AIDS A" },
      { name: "Hashini. M.S", department: "CSE", classSection: "CSE A" },
      { name: "Yaja Priya. N", department: "CSE", classSection: "CSE A" },
      { name: "Bavadharani. K", department: "CSE", classSection: "CSE A" },
    ],
  },
  {
    tribeName: "Design Dynamo",
    members: [
      { name: "Afrah", department: "Creative & Design", classSection: "Group I" },
      { name: "Janani K", department: "CSE", classSection: "CSE" },
      { name: "Mubeena", department: "AI & DS", classSection: "AIDS(A)" },
      { name: "Blessy", department: "CSE / AI & DS", classSection: "CSE/AIDS (A)" },
      { name: "Dhana Shri", department: "CSE", classSection: "CSE" },
      { name: "Rochelle", department: "CSE", classSection: "CSE" },
      { name: "Divya Dharshini", department: "AI & DS", classSection: "AIDS" },
      { name: "Aishwarya", department: "AI & DS", classSection: "AIDS" },
      { name: "Athya", department: "CSE", classSection: "CSE" },
      { name: "Janani", department: "CSE", classSection: "CSE" },
    ],
  },
  {
    tribeName: "Blueprint Builders",
    aliases: ["Blue Print Builders"],
    members: [
      { name: "Aradhana. P", department: "CSE", classSection: "CSE-A" },
      { name: "Asmitha. P", department: "AI & DS", classSection: "AI-DS-A" },
      { name: "Menaka N", department: "AI & DS", classSection: "AI-DS-A" },
      { name: "Logapriya D", department: "AI & DS", classSection: "AI-DS-A" },
      { name: "Harini. M.R", department: "CSE", classSection: "CSE-A" },
      { name: "Harini. M", department: "CSE", classSection: "CSE-A" },
      { name: "Lavanya", department: "AI & DS", classSection: "AI-DS-A" },
      { name: "Kaviya", department: "AI & DS", classSection: "AI-DS-A" },
      { name: "Hasifa Tabassum. N", department: "AI & DS", classSection: "AI-DS-A" },
      { name: "Harlean Ricky K", department: "AI & DS", classSection: "AI-DS-A" },
    ],
  },
  {
    tribeName: "Aesthetic Architects",
    members: [
      { name: "V. Mathumitha", department: "AI & DS", classSection: "AIDS" },
      { name: "M. Jeffy", department: "AI & DS", classSection: "AIDS" },
      { name: "B. Divya Dharshini", department: "AI & DS", classSection: "AIDS" },
      { name: "P. Darsha", department: "CSE", classSection: "CSE" },
      { name: "J. Divya Darshini", department: "CSE", classSection: "CSE" },
      { name: "Dharshini. S", department: "CSE", classSection: "CSE 'A'" },
      { name: "J. Jessy Rebekah", department: "CSE", classSection: "CSE-A" },
      { name: "P. Keerthi", department: "Creative & Design", classSection: "Group I" },
      { name: "Dipsikha. R", department: "AI & DS", classSection: "AIDS" },
      { name: "Meghasree. S", department: "AI & DS", classSection: "AIDS" },
    ],
  },
  {
    tribeName: "Pixel Pioneers",
    members: [
      { name: "Aadharshana", department: "Civil", classSection: "Civil" },
      { name: "Deva Karini", department: "Civil", classSection: "CIVIL" },
      { name: "Sivadarshana", department: "Civil", classSection: "CIVIL" },
      { name: "Vaishali", department: "Civil", classSection: "CIVIL" },
      { name: "Priyanka", department: "Civil", classSection: "CIVIL" },
      { name: "Manasa", department: "AI & DS", classSection: "AIDS" },
      { name: "Angel", department: "AI & DS", classSection: "AIDS" },
      { name: "Lavanya", department: "AI & DS", classSection: "AIDS" },
      { name: "Gowri", department: "Creative & Design", classSection: "Group I" },
      { name: "Nisha", department: "Creative & Design", classSection: "Group I" },
    ],
  },
];

const TRIBE_CODE_MAP = {
  "Pixel Pioneers": "SIP-001",
  "Design Dynamo": "SIP-002",
  "Imaginex": "SIP-003",
  "Aesthetic Architects": "SIP-004",
  "Vector Vanguard": "SIP-005",
  "Vision Barv I": "SIP-006",
  "Blueprint Builders": "SIP-007",
  "Prism Prodigies": "SIP-008",
  "Vivid Visionaries": "SIP-011",
  "Inventory Bubbles": "SIP-012",
  "Drafting Dynamos": "SIP-013",
  "Spectrum Squad": "SIP-014",
  "Origami Ops": "SIP-015",
  "Nexus Artisans": "SIP-016",
  "Nexora": "SIP-017",
  "Kinetic Creations": "SIP-018",
};

async function updateTribeDetails() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const group1Venue = await Venue.findOne({ groupName: "Group I" });
  if (!group1Venue) {
    console.error("Group I venue not found.");
    process.exit(1);
  }

  for (const item of GROUP1_DATA) {
    const code = TRIBE_CODE_MAP[item.tribeName];
    let tribe = await Tribe.findOne({ tribeCode: code });

    if (!tribe) {
      tribe = await Tribe.create({
        tribeCode: code,
        tribeName: item.tribeName,
        groupName: "Group I",
        theme: "Creative & Design",
        venueId: group1Venue._id,
        status: "active",
      });
      console.log(`Created new tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    } else {
      tribe.tribeName = item.tribeName;
      tribe.theme = "Creative & Design";
      tribe.groupName = "Group I";
      tribe.venueId = group1Venue._id;
      await tribe.save();
      console.log(`Updated tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    }

    // Replace members for this tribe with exact provided list
    await Member.deleteMany({ tribeId: tribe._id });
    const memberDocs = item.members.map((m) => ({
      tribeId: tribe._id,
      name: m.name,
      department: m.department || "Creative & Design",
      classSection: m.classSection || "",
    }));
    await Member.insertMany(memberDocs);
    console.log(`  -> Inserted ${memberDocs.length} verified members for ${tribe.tribeName} (${tribe.tribeCode})`);
  }

  console.log("All Group I tribes and member details updated successfully with clean 1-to-1 codes.");
  await mongoose.disconnect();
}

updateTribeDetails().catch((err) => {
  console.error("Error updating tribes:", err);
  process.exit(1);
});
