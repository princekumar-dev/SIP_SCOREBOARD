const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {}
const mongoose = require("mongoose");
const { mongoUri } = require("./config");
const Tribe = require("./models/Tribe");
const Member = require("./models/Member");
const Venue = require("./models/Venue");

const GROUP4_DATA = [
  {
    tribeName: "Phoenix Legion",
    tribeCode: "SIP-055",
    members: [
      { name: "Eesa (TL)", department: "ECE", classSection: "ECE" },
      { name: "Dhanush", department: "ECE", classSection: "ECE" },
      { name: "Rahul", department: "CSE", classSection: "CSC" },
      { name: "Sam", department: "CSE", classSection: "CSC" },
      { name: "Praveen", department: "CSE", classSection: "CSC" },
    ],
  },
  {
    tribeName: "Titan Force",
    tribeCode: "SIP-056",
    members: [
      { name: "Maharnitha. K", department: "CSE", classSection: "CSE" },
      { name: "Keerthanaa. R", department: "CSE", classSection: "CSE" },
      { name: "Lakshitha. B", department: "CSE", classSection: "CSE" },
      { name: "Kaviya. D (Team Leader)", department: "CSE", classSection: "CSE" },
      { name: "Mancy Shibi", department: "CSE", classSection: "CSE" },
      { name: "Manya. K", department: "MECH", classSection: "MECH" },
      { name: "Initha. M.A", department: "ECE", classSection: "ECE" },
      { name: "Christina. B", department: "ECE", classSection: "ECE" },
      { name: "Charies. T", department: "ECE", classSection: "ECE" },
      { name: "Akashya. M", department: "ECE", classSection: "ECE" },
    ],
  },
  {
    tribeName: "Algorithmic Assemblers",
    tribeCode: "SIP-057",
    members: [
      { name: "Divya Dharshini. S", department: "MECH", classSection: "Mech" },
      { name: "Vanishree. R", department: "MECH", classSection: "Mech" },
      { name: "Devananda. R", department: "MECH", classSection: "Mech" },
      { name: "Noora. A (Team Leader)", department: "MECH", classSection: "Mech" },
      { name: "Pooja Sri. B", department: "CSE", classSection: "CSE" },
      { name: "P. Roshini", department: "CSE", classSection: "CSE" },
      { name: "Rithikhashri. A", department: "CSE", classSection: "CSE" },
      { name: "Sakthi Sakara. S", department: "CSE", classSection: "CSE" },
      { name: "Nishanthika. G", department: "CSE", classSection: "CSE" },
    ],
  },
  {
    tribeName: "Nova Squad",
    tribeCode: "SIP-058",
    members: [
      { name: "Revin Josh. V.S", department: "MECH", classSection: "Mech" },
      { name: "Sivarama Krishnan. J", department: "MECH", classSection: "Mech" },
      { name: "Rahamathul Ranaman. S.K", department: "MECH", classSection: "Mech" },
      { name: "Linkeshwaran. S", department: "MECH", classSection: "Mech" },
      { name: "Mohith Raj. S", department: "CSE", classSection: "CS" },
      { name: "Rohan. D", department: "CSE", classSection: "CS" },
      { name: "Pranav Aadithya. B", department: "CSE", classSection: "CS" },
      { name: "Arun Grandhi. S (Leader)", department: "ECE", classSection: "ECE" },
      { name: "Mohamed Rehaan. R", department: "ECE", classSection: "ECE" },
      { name: "Jayendra. M", department: "ECE", classSection: "ECE" },
    ],
  },
  {
    tribeName: "Olympian Order",
    tribeCode: "SIP-059",
    members: [
      { name: "Krishnaa. E", department: "ECE", classSection: "ECE" },
      { name: "Pavan. S", department: "CSE", classSection: "CSE" },
      { name: "Rupeshwar. S", department: "CSE", classSection: "CSE" },
      { name: "Praveen. A", department: "CSE", classSection: "CSE" },
      { name: "Ragavan. B.V (Leader)", department: "CSE", classSection: "CSE" },
      { name: "Kavin. S", department: "ECE", classSection: "ECE" },
      { name: "Naveen. K", department: "MECH", classSection: "Mech" },
      { name: "Sanjay. S", department: "MECH", classSection: "Mech" },
      { name: "Siva Prasanth. B", department: "MECH", classSection: "Mech" },
      { name: "Vijaya Kumar. M", department: "MECH", classSection: "Mech" },
    ],
  },
  {
    tribeName: "Dragon Riders",
    tribeCode: "SIP-060",
    members: [
      { name: "Perinbha pranav RJ", department: "CSE", classSection: "CSE B" },
      { name: "Keerthana", department: "CSE", classSection: "CSE B" },
      { name: "Priyadharshini", department: "CSE", classSection: "CSE B" },
      { name: "Lakshita", department: "CSE", classSection: "CSE B" },
      { name: "Kaviya", department: "ECE", classSection: "ECE" },
      { name: "Jeyashree", department: "ECE", classSection: "ECE" },
      { name: "Madhumitha", department: "ECE", classSection: "ECE" },
      { name: "Anushya", department: "ECE", classSection: "ECE" },
      { name: "Fousiya", department: "ECE", classSection: "ECE" },
      { name: "Brindha Lakshmi", department: "ECE", classSection: "ECE" },
    ],
  },
  {
    tribeName: "Griffin Guild",
    tribeCode: "SIP-061",
    members: [
      { name: "Karunya. R", department: "CSE", classSection: "CSE" },
      { name: "Nadhiya. M", department: "CSE", classSection: "CSE" },
      { name: "Poojasri. B", department: "CSE", classSection: "CSE" },
      { name: "Khyati Jain. Y (Team Leader)", department: "CSE", classSection: "CSE" },
      { name: "Keerthana. E", department: "CSE", classSection: "CSE" },
      { name: "Madhivadhani. B", department: "ECE", classSection: "ECE" },
      { name: "Jagapriya Saronjini. J", department: "ECE", classSection: "ECE" },
      { name: "Keerthika S.K", department: "ECE", classSection: "ECE" },
      { name: "Kavipriya. E", department: "ECE", classSection: "ECE" },
      { name: "Deva Dharshini. T", department: "ECE", classSection: "ECE" },
    ],
  },
  {
    tribeName: "Slayers",
    tribeCode: "SIP-062",
    members: [
      { name: "Mandala Ramcharan", department: "ECE", classSection: "ECE" },
      { name: "Kathiravan. R.C", department: "ECE", classSection: "ECE" },
      { name: "Mohamed Kaleemuddin. M.K", department: "ECE", classSection: "ECE" },
      { name: "Roshan Jeffrin R", department: "CSE", classSection: "CSE" },
      { name: "Kishore", department: "ECE", classSection: "ECE" },
      { name: "Mitlesh", department: "CSE", classSection: "CSE" },
      { name: "Jobesh. N.D", department: "MECH", classSection: "Mech" },
      { name: "Dhanush Kumar. R", department: "MECH", classSection: "Mech" },
      { name: "Sarathy. S", department: "MECH", classSection: "Mech" },
    ],
  },
  {
    tribeName: "Mythic Mavens",
    tribeCode: "SIP-063",
    members: [
      { name: "Ajay Sriram", department: "ECE", classSection: "ECE-A" },
      { name: "Aravind", department: "CSE", classSection: "CSE-B" },
      { name: "Dayaa Shankar", department: "MECH", classSection: "Mech" },
      { name: "Faisal", department: "ECE", classSection: "ECE-A" },
      { name: "Lokeshwaran (Captain)", department: "ECE", classSection: "ECE-A" },
      { name: "Hariharan N.R", department: "ECE", classSection: "ECE-A" },
      { name: "Krishnan. E", department: "CSE", classSection: "CSEB" },
      { name: "Niranjan. R", department: "MECH", classSection: "Mech" },
      { name: "Matheshwaran", department: "CSE", classSection: "CSE-B" },
      { name: "Haribam", department: "MECH", classSection: "Mech" },
    ],
  },
  {
    tribeName: "Titanium",
    tribeCode: "SIP-064",
    members: [
      { name: "Eliza winifer", department: "ECE", classSection: "ECE" },
      { name: "Keerthana S", department: "ECE", classSection: "ECE" },
      { name: "Lithikaa", department: "ECE", classSection: "ECE" },
      { name: "Kana kavi T", department: "ECE", classSection: "ECE" },
      { name: "Ainul S", department: "ECE", classSection: "ECE" },
      { name: "Nethra R", department: "CSE", classSection: "CSE" },
      { name: "Kaviya Manivasan", department: "CSE", classSection: "CSE" },
      { name: "Sahithya", department: "CSE", classSection: "CSE" },
      { name: "Kayalvizhi S", department: "CSE", classSection: "CSE" },
      { name: "Rozhini R", department: "CSE", classSection: "CSE" },
    ],
  },
  {
    tribeName: "Aegis Alliance",
    tribeCode: "SIP-065",
    members: [
      { name: "Nehan Mohamed (TL)", department: "MECH", classSection: "ME" },
      { name: "Lakshay Ganesh", department: "MECH", classSection: "ME" },
      { name: "Darvin", department: "CSE", classSection: "CSE-B" },
      { name: "Irfan", department: "CSE", classSection: "CSE-B" },
      { name: "Akash", department: "ECE", classSection: "ECE-A" },
      { name: "Jagan. M", department: "ECE", classSection: "ECE-A" },
      { name: "Gautham", department: "ECE", classSection: "ECE-A" },
      { name: "Mahesh", department: "ECE", classSection: "ECE-A" },
      { name: "Kanthi K.N", department: "ECE", classSection: "ECE-A" },
      { name: "Keswar Moorthi. G", department: "CSE", classSection: "CSE-B" },
    ],
  },
  {
    tribeName: "Chimera Champions",
    tribeCode: "SIP-066",
    members: [
      { name: "T. Guna (Captain)", department: "ECE", classSection: "ECE-A" },
      { name: "Midhun Bharath", department: "ECE", classSection: "ECE-A" },
      { name: "Lokesh", department: "ECE", classSection: "ECE-A" },
      { name: "Clarance", department: "ECE", classSection: "ECE-A" },
      { name: "Mohanraj", department: "CSE", classSection: "CSE-B" },
      { name: "Kiranraj", department: "CSE", classSection: "CSE-B" },
      { name: "Aravindh", department: "MECH", classSection: "Mech" },
      { name: "Bhuvanraj", department: "MECH", classSection: "Mech" },
      { name: "Kavin", department: "CSE", classSection: "CSE-B" },
      { name: "Abhishek", department: "ECE", classSection: "ECE-A" },
    ],
  },
  {
    tribeName: "Immortal Minds",
    tribeCode: "SIP-067",
    members: [
      { name: "Dharshana B", department: "ECE", classSection: "ECE" },
      { name: "Nirosha S", department: "CSE", classSection: "CSE" },
      { name: "Prakalya Devi V", department: "CSE", classSection: "CSE" },
      { name: "Rohitha K", department: "CSE", classSection: "CSE" },
      { name: "Kodhai S", department: "CSE", classSection: "CSE" },
      { name: "Kayalvizhi M", department: "CSE", classSection: "CSE" },
      { name: "Dharshini shree S", department: "ECE", classSection: "ECE" },
      { name: "Kumudhini T", department: "ECE", classSection: "ECE" },
      { name: "Gopika A", department: "ECE", classSection: "ECE" },
      { name: "Johana Pauline S", department: "ECE", classSection: "ECE" },
    ],
  },
];

async function updateGroup4TribeDetails() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const group4Venue = await Venue.findOne({ groupName: "Group IV" });
  if (!group4Venue) {
    console.error("Group IV venue not found.");
    process.exit(1);
  }

  for (const item of GROUP4_DATA) {
    let tribe = await Tribe.findOne({ tribeCode: item.tribeCode });

    if (!tribe) {
      tribe = await Tribe.create({
        tribeCode: item.tribeCode,
        tribeName: item.tribeName,
        groupName: "Group IV",
        theme: "Legends & Mythology",
        venueId: group4Venue._id,
        status: "active",
      });
      console.log(`Created new tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    } else {
      tribe.tribeName = item.tribeName;
      tribe.theme = "Legends & Mythology";
      tribe.groupName = "Group IV";
      tribe.venueId = group4Venue._id;
      await tribe.save();
      console.log(`Updated tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    }

    // Replace members for this tribe with exact provided list
    await Member.deleteMany({ tribeId: tribe._id });
    const memberDocs = item.members.map((m) => ({
      tribeId: tribe._id,
      name: m.name,
      department: m.department || "Legends & Mythology",
      classSection: m.classSection || "",
    }));
    await Member.insertMany(memberDocs);
    console.log(`  -> Inserted ${memberDocs.length} verified members for ${tribe.tribeName} (${tribe.tribeCode})`);
  }

  console.log("All Group IV tribes and member details updated successfully with clean codes.");
  await mongoose.disconnect();
}

updateGroup4TribeDetails().catch((err) => {
  console.error("Error updating Group IV tribes:", err);
  process.exit(1);
});
