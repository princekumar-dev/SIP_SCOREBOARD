const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {}
const mongoose = require("mongoose");
const { mongoUri } = require("./config");
const Tribe = require("./models/Tribe");
const Member = require("./models/Member");
const Venue = require("./models/Venue");

const GROUP5_DATA = [
  {
    tribeName: "Voltric Sparks",
    tribeCode: "SIP-073",
    members: [
      { name: "S. Santhosh (TL)", department: "Power & Energy", classSection: "Group V" },
      { name: "V.K. Udhaya Narasiman", department: "Power & Energy", classSection: "Group V" },
      { name: "G. Tharunn", department: "Power & Energy", classSection: "Group V" },
      { name: "M. Srivanjith", department: "Power & Energy", classSection: "Group V" },
      { name: "P. Kabilan", department: "Power & Energy", classSection: "Group V" },
      { name: "R. Sethuram", department: "Power & Energy", classSection: "Group V" },
      { name: "S. Thamodharan", department: "Power & Energy", classSection: "Group V" },
      { name: "D. Praneshwaran", department: "Power & Energy", classSection: "Group V" },
      { name: "S. Lakshan Kumar", department: "Power & Energy", classSection: "Group V" },
    ],
  },
  {
    tribeName: "Wonderwatt",
    tribeCode: "SIP-074",
    members: [
      { name: "Vinnarasi. A", department: "Power & Energy", classSection: "Group V" },
      { name: "Sangeetha. M.S", department: "Power & Energy", classSection: "Group V" },
      { name: "Roshini. M", department: "Power & Energy", classSection: "Group V" },
      { name: "Shrinithi Selvaraj", department: "Power & Energy", classSection: "Group V" },
      { name: "Shivani. P", department: "Power & Energy", classSection: "Group V" },
      { name: "Subhasri. S.V", department: "Power & Energy", classSection: "Group V" },
      { name: "Prithikaa. M", department: "Power & Energy", classSection: "Group V" },
      { name: "Krithika. R", department: "Power & Energy", classSection: "Group V" },
      { name: "Naadhira. M", department: "Power & Energy", classSection: "Group V" },
    ],
  },
  {
    tribeName: "Ignite X",
    tribeCode: "SIP-075",
    members: [
      { name: "Keerthika. L (Leader)", department: "IT", classSection: "B.Tech IT" },
      { name: "Mohanagiri Priya. D", department: "IT", classSection: "B.Tech IT" },
      { name: "Pavuluru Yashwini", department: "ECE", classSection: "B.E ECE" },
      { name: "Prashika Sri. CS", department: "IT", classSection: "B.Tech IT" },
      { name: "Sivaranjani. JJ", department: "ECE", classSection: "B.E ECE" },
      { name: "Sharmila. V", department: "ECE", classSection: "B.E ECE" },
      { name: "Shelli Sree. J", department: "ECE", classSection: "B.E ECE" },
      { name: "Subiksha. RS", department: "CSE", classSection: "B.E CSE-C" },
      { name: "Tarunika. M", department: "CSE", classSection: "B.E CSE-C" },
      { name: "Varunavi. S", department: "CSE", classSection: "B.E CSE-C" },
    ],
  },
  {
    tribeName: "Volt Coders",
    tribeCode: "SIP-076",
    members: [
      { name: "P. Pooja (Leader)", department: "IT", classSection: "IT" },
      { name: "T. Sharmila", department: "CSE", classSection: "CSE" },
      { name: "E. Tharani", department: "CSE", classSection: "CSE" },
      { name: "A. Sanjana", department: "CSE", classSection: "CSE" },
      { name: "M. Krishna Ragavi", department: "IT", classSection: "IT" },
      { name: "P. Lokeshwari", department: "IT", classSection: "IT" },
      { name: "V.A. Kamalini", department: "IT", classSection: "IT" },
    ],
  },
  {
    tribeName: "Watt A Team",
    tribeCode: "SIP-077",
    members: [
      { name: "Tanvee. S (Lead)", department: "CSE", classSection: "CSE" },
      { name: "SG Thabanaashree", department: "CSE", classSection: "CSE" },
      { name: "Neha. R Seervi", department: "ECE", classSection: "ECE" },
      { name: "Pavanthi. B", department: "ECE", classSection: "ECE" },
      { name: "Sarumathi A", department: "ECE", classSection: "ECE" },
      { name: "Makishka. S", department: "IT", classSection: "IT" },
      { name: "Keerthi Varshini TR", department: "IT", classSection: "IT" },
      { name: "Tejasri. R", department: "CSE", classSection: "CSE" },
    ],
  },
  {
    tribeName: "Energon",
    tribeCode: "SIP-078",
    members: [
      { name: "Santhosh (Team Leader)", department: "CSE", classSection: "CSE-C" },
      { name: "Shevanesh", department: "CSE", classSection: "CSE-C" },
      { name: "Syed Aamir Suhail", department: "CSE", classSection: "CSE-C" },
      { name: "Syed Rehan Ahmed", department: "CSE", classSection: "CSE-C" },
      { name: "Krisha", department: "IT", classSection: "IT" },
      { name: "Premkumar", department: "IT", classSection: "IT" },
      { name: "Prajan", department: "IT", classSection: "IT" },
      { name: "Vaideshwar", department: "ECE", classSection: "ECE" },
      { name: "Suriya", department: "ECE", classSection: "ECE" },
      { name: "Shanmuganathan", department: "ECE", classSection: "ECE" },
    ],
  },
  {
    tribeName: "Energy Titans",
    tribeCode: "SIP-079",
    members: [
      { name: "Santhosh. R (Tribe Leader)", department: "CSE", classSection: "CSE-C" },
      { name: "Sanjayvasan. T", department: "CSE", classSection: "CSE-C" },
      { name: "Shomnath. G", department: "CSE", classSection: "CSE-C" },
      { name: "Lokeshwaran. K", department: "IT", classSection: "IT-B" },
      { name: "Monesh. S", department: "IT", classSection: "IT-B" },
      { name: "Kishore. S", department: "IT", classSection: "IT-B" },
      { name: "Thiru Kumaran. S", department: "ECE", classSection: "ECE-B" },
      { name: "Mythreyan. S", department: "ECE", classSection: "ECE-B" },
      { name: "Vasan. BK", department: "ECE", classSection: "ECE-B" },
    ],
  },
  {
    tribeName: "Power Nautical",
    tribeCode: "SIP-080",
    members: [
      { name: "A.R. Shreeviha (Team Leader)", department: "CSE", classSection: "CSE" },
      { name: "Sruthilaya. C", department: "ECE", classSection: "ECE" },
      { name: "Pavitha. P", department: "ECE", classSection: "ECE" },
      { name: "Prathi Supriya", department: "ECE", classSection: "ECE" },
      { name: "Shrivarshini", department: "ECE", classSection: "ECE" },
      { name: "Saranya", department: "CSE", classSection: "CS" },
      { name: "Logeshwari. P", department: "IT", classSection: "IT" },
      { name: "Ragavi. S", department: "IT", classSection: "IT" },
      { name: "Tejaswini. G.P", department: "ECE", classSection: "ECE" },
    ],
  },
  {
    tribeName: "Solar Panel",
    tribeCode: "SIP-081",
    members: [
      { name: "M. Rajeshwari (Team Leader)", department: "IT", classSection: "IT" },
      { name: "K. Ragavi", department: "IT", classSection: "IT" },
      { name: "R. Kavi Priya", department: "IT", classSection: "IT" },
      { name: "Navaneetha. S.V", department: "IT", classSection: "IT" },
      { name: "Manasha. S", department: "IT", classSection: "IT" },
      { name: "M. Ragavi", department: "ECE", classSection: "ECE" },
      { name: "Padma Sri. M", department: "ECE", classSection: "ECE" },
      { name: "Syeda Bathul", department: "CSE", classSection: "CSE" },
      { name: "S. Tanushri", department: "CSE", classSection: "CSE" },
    ],
  },
  {
    tribeName: "Destructive mc²",
    tribeCode: "SIP-082",
    members: [
      { name: "Vasanthakumar (Leader)", department: "CSE", classSection: "CSE" },
      { name: "Vasanth", department: "CSE", classSection: "CSE" },
      { name: "Vithesh", department: "CSE", classSection: "CSE" },
      { name: "Tejesh Buddhi", department: "CSE", classSection: "CSE" },
      { name: "Tanveer Ahmad", department: "ECE", classSection: "ECE" },
      { name: "Santhosh", department: "ECE", classSection: "ECE" },
      { name: "Naveen Kumar R", department: "ECE", classSection: "ECE" },
      { name: "Nithish Kumar. K", department: "IT", classSection: "IT" },
      { name: "Kamesh. B.J", department: "IT", classSection: "IT" },
      { name: "John Ajay. A", department: "IT", classSection: "IT" },
    ],
  },
  {
    tribeName: "Luminous",
    tribeCode: "SIP-083",
    members: [
      { name: "Seetha Lakshmi (Group Leader)", department: "CSE", classSection: "CSE" },
      { name: "Swathi. T", department: "CSE", classSection: "CSE" },
      { name: "Varsha. S", department: "CSE", classSection: "CSE" },
      { name: "Priyadharshini. V", department: "IT", classSection: "IT" },
      { name: "Priyanka. K", department: "IT", classSection: "IT" },
      { name: "Priya. A", department: "IT", classSection: "IT" },
      { name: "Joyce Rithanya. P", department: "IT", classSection: "IT" },
    ],
  },
  {
    tribeName: "Circuit Breakers",
    tribeCode: "SIP-084",
    members: [
      { name: "Vijayasri. V (Team Leader)", department: "Power & Energy", classSection: "Group V" },
      { name: "Yashika. E", department: "Power & Energy", classSection: "Group V" },
      { name: "Sanjanya M", department: "Power & Energy", classSection: "Group V" },
      { name: "Shibathul Kai. N", department: "Power & Energy", classSection: "Group V" },
      { name: "Prithika. M", department: "Power & Energy", classSection: "Group V" },
      { name: "Mokshah. S", department: "Power & Energy", classSection: "Group V" },
      { name: "Lakshmi Sowmiya. B", department: "Power & Energy", classSection: "Group V" },
      { name: "R. Vaishnavi", department: "Power & Energy", classSection: "Group V" },
      { name: "Varsha Shree. M", department: "Power & Energy", classSection: "Group V" },
      { name: "Shalini S", department: "Power & Energy", classSection: "Group V" },
    ],
  },
  {
    tribeName: "Kinetic Knights",
    tribeCode: "SIP-085",
    members: [
      { name: "Padmanabhan. M", department: "ECE", classSection: "ECE" },
      { name: "Mohammed Owais. F", department: "ECE", classSection: "ECE" },
      { name: "Vishnu. M", department: "ECE", classSection: "ECE" },
      { name: "Thangappan. E", department: "ECE", classSection: "ECE" },
      { name: "Mohammed Raihan Khan (Lead)", department: "ECE", classSection: "ECE" },
    ],
  },
  {
    tribeName: "Electra",
    tribeCode: "SIP-086",
    members: [
      { name: "P. Sharon Charisma", department: "CSE", classSection: "CSE" },
      { name: "S. Surekha (Team Leader)", department: "CSE", classSection: "CSE" },
      { name: "S.M. Tharini", department: "CSE", classSection: "CSE" },
      { name: "K. Kavya Shree", department: "IT", classSection: "IT" },
      { name: "Karolina Rajkumar", department: "IT", classSection: "IT" },
      { name: "Loshika. P", department: "IT", classSection: "IT" },
      { name: "Roshini. P", department: "ECE", classSection: "ECE" },
      { name: "Tanushree. P", department: "ECE", classSection: "ECE" },
      { name: "Pragathi. B", department: "ECE", classSection: "ECE" },
    ],
  },
  {
    tribeName: "Volt Warriors",
    tribeCode: "SIP-087",
    members: [
      { name: "Sarvagnya PV (Leader)", department: "Power & Energy", classSection: "Group V" },
      { name: "Sathya Narayan M", department: "Power & Energy", classSection: "Group V" },
      { name: "D. Tharun Sayee (Leader/substitute)", department: "Power & Energy", classSection: "Group V" },
      { name: "Santhosh M", department: "Power & Energy", classSection: "Group V" },
      { name: "Vighwash", department: "Power & Energy", classSection: "Group V" },
      { name: "Sathish Kumar G", department: "Power & Energy", classSection: "Group V" },
      { name: "Pon Suresh", department: "Power & Energy", classSection: "Group V" },
      { name: "Pratheep Kumar", department: "Power & Energy", classSection: "Group V" },
    ],
  },
  {
    tribeName: "Power Dynasty",
    tribeCode: "SIP-088",
    members: [
      { name: "Sri Ragaan (Team Leader)", department: "Power & Energy", classSection: "Group V" },
      { name: "M. Mohamed Niyas", department: "IT", classSection: "IT B" },
      { name: "S. Madhavan", department: "IT", classSection: "IT B" },
      { name: "V.K. Varun Srinivas", department: "CSE", classSection: "CSC C" },
      { name: "S. Shashank", department: "CSE", classSection: "CSC C" },
      { name: "M. Kavinesh", department: "IT", classSection: "IT B" },
      { name: "B. Sundar", department: "CSE", classSection: "CSC C" },
      { name: "C. Ramsundar", department: "ECE", classSection: "ECE B" },
      { name: "K.A. Yogesh Kumar", department: "ECE", classSection: "ECE B" },
      { name: "R. Surya", department: "ECE", classSection: "ECE B" },
    ],
  },
  {
    tribeName: "Power Rangers",
    tribeCode: "SIP-089",
    members: [
      { name: "Saravana Selvan. BK (TML)", department: "Power & Energy", classSection: "Group V" },
      { name: "Nidhish Kumar. K", department: "Power & Energy", classSection: "Group V" },
      { name: "Jeshu Gladson. I", department: "Power & Energy", classSection: "Group V" },
      { name: "Mohamed Idris. J", department: "Power & Energy", classSection: "Group V" },
      { name: "Samaran. S", department: "Power & Energy", classSection: "Group V" },
      { name: "Shamsri. K", department: "Power & Energy", classSection: "Group V" },
      { name: "Tarun. S", department: "Power & Energy", classSection: "Group V" },
      { name: "Ramcharan. K.V", department: "Power & Energy", classSection: "Group V" },
      { name: "Naresh Krishna Gnanasekar Vijaya", department: "Power & Energy", classSection: "Group V" },
    ],
  },
  {
    tribeName: "Enerzinc Pulse",
    tribeCode: "SIP-090",
    members: [
      { name: "Thanushri. R (Team Lead)", department: "CSE", classSection: "CSE" },
      { name: "Subraja", department: "CSE", classSection: "CSE" },
      { name: "Yuthikka", department: "CSE", classSection: "CSE" },
      { name: "Vincy Leelavathy", department: "ECE", classSection: "ECE" },
      { name: "Nanthiney. P.V", department: "ECE", classSection: "ECE" },
      { name: "Preetha K", department: "ECE", classSection: "ECE" },
      { name: "Mahalakhshmi", department: "IT", classSection: "IT" },
      { name: "Prathiksha Sri. S", department: "IT", classSection: "IT" },
      { name: "Kavya Sukumar Maheshwaran", department: "IT", classSection: "IT" },
    ],
  },
  {
    tribeName: "Voltelites",
    tribeCode: "SIP-091",
    members: [
      { name: "Thaiyumanavan. M (Team Leader)", department: "CSE", classSection: "CSE" },
      { name: "Sunil. V", department: "CSE", classSection: "CSE" },
      { name: "Taron. C", department: "CSE", classSection: "CSE" },
      { name: "Tharun. B", department: "ECE", classSection: "ECE" },
      { name: "Charshanth. H", department: "CSE", classSection: "CSE" },
      { name: "Mugthilan. P", department: "IT", classSection: "IT" },
      { name: "Kumaran. G", department: "IT", classSection: "IT" },
      { name: "Sobash. S", department: "ECE", classSection: "ECE" },
      { name: "Mohammed Zaarif", department: "ECE", classSection: "ECE" },
      { name: "Nelson. T", department: "IT", classSection: "IT" },
    ],
  },
];

async function updateGroup5TribeDetails() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const group5Venue = await Venue.findOne({ groupName: "Group V" });
  if (!group5Venue) {
    console.error("Group V venue not found.");
    process.exit(1);
  }

  for (const item of GROUP5_DATA) {
    let tribe = await Tribe.findOne({ tribeCode: item.tribeCode });

    if (!tribe) {
      tribe = await Tribe.create({
        tribeCode: item.tribeCode,
        tribeName: item.tribeName,
        groupName: "Group V",
        theme: "Power & Energy",
        venueId: group5Venue._id,
        status: "active",
      });
      console.log(`Created new tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    } else {
      tribe.tribeName = item.tribeName;
      tribe.theme = "Power & Energy";
      tribe.groupName = "Group V";
      tribe.venueId = group5Venue._id;
      await tribe.save();
      console.log(`Updated tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    }

    // Replace members for this tribe with exact provided list
    await Member.deleteMany({ tribeId: tribe._id });
    const memberDocs = item.members.map((m) => ({
      tribeId: tribe._id,
      name: m.name,
      department: m.department || "Power & Energy",
      classSection: m.classSection || "",
    }));
    await Member.insertMany(memberDocs);
    console.log(`  -> Inserted ${memberDocs.length} verified members for ${tribe.tribeName} (${tribe.tribeCode})`);
  }

  console.log("All Group V tribes and member details updated successfully with clean codes.");
  await mongoose.disconnect();
}

updateGroup5TribeDetails().catch((err) => {
  console.error("Error updating Group V tribes:", err);
  process.exit(1);
});
