const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {}
const mongoose = require("mongoose");
const { mongoUri } = require("./config");
const Tribe = require("./models/Tribe");
const Member = require("./models/Member");
const Venue = require("./models/Venue");

const GROUP2_DATA = [
  {
    tribeName: "Byte Brigade",
    tribeCode: "SIP-019",
    members: [
      { name: "Syed Suhaib", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Nethran", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Ramki", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Vinoth", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Deva Chandra", department: "IT", classSection: "IT" },
      { name: "Irsae", department: "IT", classSection: "IT (A)" },
      { name: "Anish", department: "IT", classSection: "IT (A)" },
      { name: "M. Riyaz Ahamed", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Rathish", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Dhakshan", department: "Cyber Security", classSection: "CSE (CS)" },
    ],
  },
  {
    tribeName: "Cyber Sentinels",
    tribeCode: "SIP-020",
    members: [
      { name: "D Vishal", department: "Cyber Security", classSection: "Cyber" },
      { name: "Lakshath", department: "Cyber Security", classSection: "Cyber" },
      { name: "Nithish", department: "Cyber Security", classSection: "Cyber" },
      { name: "Yeshwinth", department: "Cyber Security", classSection: "Cyber" },
      { name: "Monish", department: "Cyber Security", classSection: "Cyber" },
      { name: "Giridhar", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Boopesh L", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Dakshnan", department: "Cyber Security", classSection: "CSE (CS)" },
    ],
  },
  {
    tribeName: "Quantum Quarks",
    tribeCode: "SIP-021",
    members: [
      { name: "Yuvasree K", department: "AI & DS", classSection: "AIDS" },
      { name: "Yokapriya T", department: "AI & DS", classSection: "AIDS" },
      { name: "Shahana Nisha N", department: "AI & DS", classSection: "AIDS" },
      { name: "Pavithra E", department: "AI & DS", classSection: "AIDS" },
      { name: "Ramya S", department: "AI & DS", classSection: "AIDS" },
      { name: "Shanthini M", department: "AI & DS", classSection: "AIDS" },
      { name: "Rahmika R R", department: "AI & DS", classSection: "AIDS" },
      { name: "Ramya R", department: "AI & DS", classSection: "AIDS" },
      { name: "Saya M A R", department: "AI & DS", classSection: "AIDS" },
      { name: "Adeeba Kavex A", department: "AI & DS", classSection: "AIDS" },
    ],
  },
  {
    tribeName: "Neural Knights",
    tribeCode: "SIP-022",
    members: [
      { name: "Sanjai Kumar R", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Sanjay T S", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Prithish Kumar C", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Tamil", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Sai Ram", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Rohith", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Sakthi", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Sathiya Moorthy", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Vinoth", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Ramki", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Syed Mohammed Reza", department: "AI & DS", classSection: "AI/DS (B)" },
    ],
  },
  {
    tribeName: "Silicon Syndicate",
    tribeCode: "SIP-024",
    members: [
      { name: "Sivani P", department: "AI & DS", classSection: "AIDS" },
      { name: "L Yoha Lakshmi", department: "AI & DS", classSection: "AIDS" },
      { name: "Sai Santhiniya S D", department: "AI & DS", classSection: "AIDS" },
      { name: "Vedhasree K", department: "AI & DS", classSection: "AIDS" },
      { name: "Poorna B M", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Madhu Sri E", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Gopika V", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "K Kavitha", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Kumudhini Shri S", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Nivedha Sri", department: "Cyber Security", classSection: "CSE (CS)" },
    ],
  },
  {
    tribeName: "Algorithmic Aces",
    tribeCode: "SIP-025",
    members: [
      { name: "Anu Harini RHA", department: "IT", classSection: "IT-A" },
      { name: "Aishwarya", department: "IT", classSection: "IT-A" },
      { name: "Harini V", department: "IT", classSection: "IT-A" },
      { name: "Dharani Sri K", department: "IT", classSection: "IT-A" },
      { name: "Ankita Tiwari", department: "IT", classSection: "IT-A" },
      { name: "Deepika N", department: "IT", classSection: "IT-A" },
      { name: "Elkia K", department: "IT", classSection: "IT-A" },
      { name: "Ishwarya K", department: "IT", classSection: "IT-A" },
      { name: "Blessy Jasamin A", department: "IT", classSection: "IT-A" },
      { name: "Aathmika M", department: "IT", classSection: "IT-A" },
    ],
  },
  {
    tribeName: "Logic Lords",
    tribeCode: "SIP-027",
    members: [
      { name: "Samsun Fasiya", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Sangrita", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Niranjana", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Geetha", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Rashmi", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Janani", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Daphin", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Sarah", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Atheefa", department: "Cyber Security", classSection: "Cyber Security" },
    ],
  },
  {
    tribeName: "Cipher Crew",
    tribeCode: "SIP-028",
    members: [
      { name: "Harshini", department: "IT", classSection: "IT" },
      { name: "Madhura", department: "IT", classSection: "IT" },
      { name: "Puranjani", department: "IT", classSection: "IT" },
      { name: "Yasmeen", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Sahla Rasina", department: "AI & DS", classSection: "AI/DS (B)" },
      { name: "Harini", department: "IT", classSection: "IT" },
      { name: "Agalya", department: "IT", classSection: "IT" },
      { name: "Kaviya S", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Abhisa A", department: "Cyber Security", classSection: "CSE (CS)" },
      { name: "Shimaranjani", department: "AI & DS", classSection: "AI/DS" },
    ],
  },
  {
    tribeName: "Future Forge",
    tribeCode: "SIP-029",
    members: [
      { name: "Asmitha", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Ananya", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Deepika", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Hazana", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Akshaya", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Harshini", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Dhilshath", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Abinaya", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Divyabharathi", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Jenniya", department: "Technology & Innovation", classSection: "Group II" },
    ],
  },
  {
    tribeName: "Tech Titans",
    tribeCode: "SIP-030",
    members: [
      { name: "Yogith P", department: "IT", classSection: "IT" },
      { name: "Sanjay B", department: "IT", classSection: "IT" },
      { name: "Puranthar AB", department: "IT", classSection: "IT" },
      { name: "Nisanth S", department: "IT", classSection: "IT" },
      { name: "Vijaya Ragav E", department: "IT", classSection: "IT" },
      { name: "Abinesh M", department: "IT", classSection: "IT" },
      { name: "Anish Antony R", department: "IT", classSection: "IT" },
      { name: "Balapriyan T", department: "IT", classSection: "IT" },
      { name: "Bharanidharan M", department: "IT", classSection: "IT" },
      { name: "Pavan Raj N", department: "IT", classSection: "IT" },
    ],
  },
  {
    tribeName: "Matrix Mavens",
    tribeCode: "SIP-031",
    members: [
      { name: "Muskan M", department: "Cyber Security", classSection: "CYS" },
      { name: "Kiranmayi B", department: "Cyber Security", classSection: "CYS" },
      { name: "Tuhina S", department: "Cyber Security", classSection: "CYS" },
      { name: "Gayathri V", department: "Cyber Security", classSection: "CYS" },
      { name: "Anusha A", department: "IT", classSection: "IT" },
      { name: "Andal Dharshini", department: "IT", classSection: "IT" },
      { name: "Sri Vishnu Priya", department: "AI & DS", classSection: "AI/DS" },
      { name: "Ruba Zainab N", department: "AI & DS", classSection: "AI/DS" },
      { name: "Rakshithak B", department: "AI & DS", classSection: "AI/DS" },
      { name: "Vishnu Priya A", department: "AI & DS", classSection: "AI/DS" },
    ],
  },
  {
    tribeName: "Binary Blitz",
    tribeCode: "SIP-032",
    members: [
      { name: "Mahashreeya M", department: "Cyber Security", classSection: "Cyber" },
      { name: "Mamtha M", department: "AI & DS", classSection: "AIDS-B" },
      { name: "Sandhiya S", department: "IT", classSection: "IT-A" },
      { name: "Keerthilakshmi V", department: "AI & DS", classSection: "AIDS-B" },
      { name: "Akshaya S V", department: "IT", classSection: "IT-A" },
      { name: "Subha Lakshmi", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Nafia Shiroze", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Vigacini", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Priyanka", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Sri Hamsini Poraturi", department: "Technology & Innovation", classSection: "Group II" },
    ],
  },
  {
    tribeName: "Tech Stars",
    tribeCode: "SIP-033",
    members: [
      { name: "Saghithya M S", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Rachel", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Riya Shain", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Yogarathna", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Praisy Gifta", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Thirisha", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Shamini", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Sakthi Janani", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Prithika", department: "Technology & Innovation", classSection: "Group II" },
      { name: "Daphine", department: "Technology & Innovation", classSection: "Group II" },
    ],
  },
  {
    tribeName: "Data Drifters",
    tribeCode: "SIP-035",
    members: [
      { name: "Sudharsan", department: "Cyber Security", classSection: "CSE (CY)" },
      { name: "Lokesh Kumaran M", department: "Cyber Security", classSection: "Cyber Security" },
      { name: "Kishore K", department: "Cyber Security", classSection: "CSE (CY)" },
      { name: "Manish", department: "Cyber Security", classSection: "CSE (CY)" },
      { name: "Shankkarthick", department: "Cyber Security", classSection: "CSE (CY)" },
      { name: "Sricharan", department: "Cyber Security", classSection: "CSE (CY)" },
      { name: "Ragul Doni A", department: "Cyber Security", classSection: "CSE (CY)" },
      { name: "Abu Khan", department: "Cyber Security", classSection: "CSE (CY)" },
      { name: "Keerthanesh", department: "Cyber Security", classSection: "CSE (CY)" },
      { name: "Arun Kumar", department: "Cyber Security", classSection: "CSE (CY)" },
    ],
  },
  {
    tribeName: "Apex Automators",
    tribeCode: "SIP-036",
    members: [
      { name: "Jaishnu F", department: "IT", classSection: "IT" },
      { name: "Buvaneswar K", department: "IT", classSection: "IT" },
      { name: "Akash V", department: "IT", classSection: "IT" },
      { name: "Aswinth A", department: "IT", classSection: "IT" },
      { name: "Hemanth Raj T", department: "IT", classSection: "IT" },
      { name: "Akash N A", department: "IT", classSection: "IT" },
      { name: "Guru Prosath M", department: "IT", classSection: "IT" },
      { name: "Anirudh", department: "IT", classSection: "IT" },
      { name: "Barath Kumar K", department: "IT", classSection: "IT" },
      { name: "Gowtham K", department: "IT", classSection: "IT" },
    ],
  },
];

async function updateGroup2TribeDetails() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const group2Venue = await Venue.findOne({ groupName: "Group II" });
  if (!group2Venue) {
    console.error("Group II venue not found.");
    process.exit(1);
  }

  for (const item of GROUP2_DATA) {
    let tribe = await Tribe.findOne({ tribeCode: item.tribeCode });

    if (!tribe) {
      tribe = await Tribe.create({
        tribeCode: item.tribeCode,
        tribeName: item.tribeName,
        groupName: "Group II",
        theme: "Technology & Innovation",
        venueId: group2Venue._id,
        status: "active",
      });
      console.log(`Created new tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    } else {
      tribe.tribeName = item.tribeName;
      tribe.theme = "Technology & Innovation";
      tribe.groupName = "Group II";
      tribe.venueId = group2Venue._id;
      await tribe.save();
      console.log(`Updated tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    }

    // Replace members for this tribe with exact provided list
    await Member.deleteMany({ tribeId: tribe._id });
    const memberDocs = item.members.map((m) => ({
      tribeId: tribe._id,
      name: m.name,
      department: m.department || "Technology & Innovation",
      classSection: m.classSection || "",
    }));
    await Member.insertMany(memberDocs);
    console.log(`  -> Inserted ${memberDocs.length} verified members for ${tribe.tribeName} (${tribe.tribeCode})`);
  }

  console.log("All Group II tribes and member details updated successfully with clean codes.");
  await mongoose.disconnect();
}

updateGroup2TribeDetails().catch((err) => {
  console.error("Error updating Group II tribes:", err);
  process.exit(1);
});
