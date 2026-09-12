const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {}
const mongoose = require("mongoose");
const { mongoUri } = require("./config");
const Tribe = require("./models/Tribe");
const Member = require("./models/Member");
const Venue = require("./models/Venue");

const GROUP3_DATA = [
  {
    tribeName: "Cosmic Voyagers",
    tribeCode: "SIP-037",
    members: [
      { name: "MOHAMMED WAHID A", department: "AI & ML", classSection: "AIML" },
      { name: "NIVAAS M", department: "AI & ML", classSection: "AIML" },
      { name: "NITHESH K", department: "AI & ML", classSection: "AIML" },
      { name: "SANJAY R", department: "IT", classSection: "IT C" },
      { name: "RAGHUL P", department: "IT", classSection: "IT C" },
      { name: "SIVANI B", department: "IT", classSection: "IT C" },
      { name: "BHARAT KRISHNAN D", department: "EEE", classSection: "EEE" },
      { name: "KAARTHIKEYAN S B", department: "EEE", classSection: "EEE" },
      { name: "ARAVIND S", department: "EEE", classSection: "EEE" },
      { name: "SAKTHI SUBBURAYAN S", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Nova Knights",
    tribeCode: "SIP-038",
    members: [
      { name: "LINGESH D", department: "AI & ML", classSection: "AIML" },
      { name: "SHAREEN SHAM V", department: "AI & ML", classSection: "AIML" },
      { name: "GOKUL S", department: "AI & ML", classSection: "AIML" },
      { name: "YOGESH R", department: "IT", classSection: "IT C" },
      { name: "SANTHOSH A", department: "IT", classSection: "IT C" },
      { name: "SARATH KUMAR S", department: "IT", classSection: "IT C" },
      { name: "ATHREYA PRABHU K", department: "EEE", classSection: "EEE" },
      { name: "AJMAL A", department: "EEE", classSection: "EEE" },
      { name: "VIJAYA GANAPATHY M", department: "EEE", classSection: "EEE" },
      { name: "YUKESH R", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Galaxy Guardians",
    tribeCode: "SIP-039",
    members: [
      { name: "SUDHAN G", department: "AI & ML", classSection: "AIML" },
      { name: "KATHIREZHILAN T", department: "AI & ML", classSection: "AIML" },
      { name: "NITHIESH K", department: "AI & ML", classSection: "AIML" },
      { name: "VISHWATH KATHIR M", department: "IT", classSection: "IT C" },
      { name: "THIRUMARAN A P M", department: "IT", classSection: "IT C" },
      { name: "SARVESH K", department: "IT", classSection: "IT C" },
      { name: "SRIRAM K S", department: "EEE", classSection: "EEE" },
      { name: "LOKESH KUMAR I", department: "EEE", classSection: "EEE" },
      { name: "SHRIRAM MURALI IYER", department: "EEE", classSection: "EEE" },
      { name: "SUNIL KUMAR J", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Stellar Minds",
    tribeCode: "SIP-040",
    members: [
      { name: "ABISHEK C", department: "AI & ML", classSection: "AIML" },
      { name: "VISHNU PRIYA K", department: "AI & ML", classSection: "AIML" },
      { name: "MADHESH P", department: "AI & ML", classSection: "AIML" },
      { name: "SUJAN J", department: "IT", classSection: "IT C" },
      { name: "SRIRAAG S", department: "IT", classSection: "IT C" },
      { name: "RAVI SHANKER P", department: "IT", classSection: "IT C" },
      { name: "TARUN S", department: "EEE", classSection: "EEE" },
      { name: "YUVANSANKAR K", department: "EEE", classSection: "EEE" },
      { name: "SANJEEVI KUMAR P", department: "EEE", classSection: "EEE" },
      { name: "RAHUL N", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Lunar Legends",
    tribeCode: "SIP-041",
    members: [
      { name: "DINESH KUMAR M", department: "AI & ML", classSection: "AIML" },
      { name: "NANDHA KUMAR S", department: "AI & ML", classSection: "AIML" },
      { name: "NIKASH S", department: "AI & ML", classSection: "AIML" },
      { name: "SIVA SAKTHI T", department: "IT", classSection: "IT C" },
      { name: "UDIT ROSHAN A", department: "IT", classSection: "IT C" },
      { name: "THARUN K", department: "IT", classSection: "IT C" },
      { name: "JOSHUA SAMPATH S", department: "EEE", classSection: "EEE" },
      { name: "NAVEEN KUMAR S", department: "EEE", classSection: "EEE" },
      { name: "SABESWARAN K", department: "EEE", classSection: "EEE" },
      { name: "GIRI JOYESAN S", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Astro Aces",
    tribeCode: "SIP-042",
    members: [
      { name: "NAVEEN M N", department: "AI & ML", classSection: "AIML" },
      { name: "GOPINATH J", department: "AI & ML", classSection: "AIML" },
      { name: "MITHRAN KUMAR V", department: "AI & ML", classSection: "AIML" },
      { name: "SIVA HARI S", department: "IT", classSection: "IT C" },
      { name: "SRIVENGADA KRISHNAN S", department: "IT", classSection: "IT C" },
      { name: "VETRI S", department: "IT", classSection: "IT C" },
      { name: "HARIHARAN B", department: "EEE", classSection: "EEE" },
      { name: "CHANDRU S", department: "EEE", classSection: "EEE" },
      { name: "VELMURUGAN R", department: "EEE", classSection: "EEE" },
      { name: "KARTHICK V", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Nebula Ninjas",
    tribeCode: "SIP-043",
    members: [
      { name: "MUGUNTHAN M R", department: "AI & ML", classSection: "AIML" },
      { name: "YUVAN SHANKAR C P", department: "AI & ML", classSection: "AIML" },
      { name: "ASHWANTH A", department: "AI & ML", classSection: "AIML" },
      { name: "Yathish R", department: "IT", classSection: "IT C" },
      { name: "SHANMUGAVEL V", department: "IT", classSection: "IT C" },
      { name: "VETRIVEL L", department: "IT", classSection: "IT C" },
      { name: "SANJAY G", department: "EEE", classSection: "EEE" },
      { name: "NISHANTH RAM S", department: "EEE", classSection: "EEE" },
      { name: "SRI VEKKA BALA SUBRAMANI S", department: "EEE", classSection: "EEE" },
      { name: "MOHAMED MURSHITH M", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Orbit Outlaws",
    tribeCode: "SIP-044",
    members: [
      { name: "PRAVEEN D", department: "AI & ML", classSection: "AIML" },
      { name: "BALA S", department: "AI & ML", classSection: "AIML" },
      { name: "LALITH KUMAR J", department: "AI & ML", classSection: "AIML" },
      { name: "THARAN SANJAY S", department: "IT", classSection: "IT C" },
      { name: "VEDHANTH V", department: "IT", classSection: "IT C" },
      { name: "SHAWN WILLIAMS MC CONNELL", department: "IT", classSection: "IT C" },
      { name: "VENKAT SRIRAM S", department: "EEE", classSection: "EEE" },
      { name: "NITHISH K", department: "EEE", classSection: "EEE" },
      { name: "POOVARASAN M", department: "EEE", classSection: "EEE" },
      { name: "MURUGAN S", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Solar Squad",
    tribeCode: "SIP-045",
    members: [
      { name: "PRADHISHA D", department: "AI & ML", classSection: "AIML" },
      { name: "PAVITHRA T", department: "AI & ML", classSection: "AIML" },
      { name: "JANANI A K", department: "AI & ML", classSection: "AIML" },
      { name: "KANISHKA N", department: "AI & ML", classSection: "AIML" },
      { name: "SRINITHI S", department: "AI & ML", classSection: "AIML" },
      { name: "SURUTHIKA V", department: "IT", classSection: "IT C" },
      { name: "TANUSHRI J", department: "IT", classSection: "IT C" },
      { name: "SHRUTHI S", department: "IT", classSection: "IT C" },
      { name: "ANANTIKA S", department: "EEE", classSection: "EEE" },
      { name: "GOPIKA S", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Comet Chasers",
    tribeCode: "SIP-046",
    members: [
      { name: "BHAVATHARANI K", department: "AI & ML", classSection: "AIML" },
      { name: "VASUNDHARA DEVI TIRUMANI", department: "AI & ML", classSection: "AIML" },
      { name: "SUPRIYA S", department: "AI & ML", classSection: "AIML" },
      { name: "MADHUNISHA V", department: "AI & ML", classSection: "AIML" },
      { name: "BHAVANA K", department: "AI & ML", classSection: "AIML" },
      { name: "SHIVANI R", department: "IT", classSection: "IT C" },
      { name: "YUVASHREE K", department: "IT", classSection: "IT C" },
      { name: "VAIBHAVALAKSHMI A", department: "IT", classSection: "IT C" },
      { name: "NISHANTHINI P", department: "EEE", classSection: "EEE" },
      { name: "ILAKIYA SHREE M", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Supernova Squad",
    tribeCode: "SIP-047",
    members: [
      { name: "SAMIKSHA PARAMESHWARI G", department: "AI & ML", classSection: "AIML" },
      { name: "THANU SHREE", department: "AI & ML", classSection: "AIML" },
      { name: "DHANUSHIYA K", department: "AI & ML", classSection: "AIML" },
      { name: "PAVITHRA D", department: "AI & ML", classSection: "AIML" },
      { name: "SUDARSHANA SREE K V", department: "IT", classSection: "IT C" },
      { name: "YASMEEN M", department: "IT", classSection: "IT C" },
      { name: "TRINITA S", department: "IT", classSection: "IT C" },
      { name: "RAKSHAMBIKA C B", department: "IT", classSection: "IT C" },
      { name: "THITHIKSHA J", department: "EEE", classSection: "EEE" },
      { name: "ARCHANA A", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Celestial Crew",
    tribeCode: "SIP-048",
    members: [
      { name: "SAGANA SRI S", department: "AI & ML", classSection: "AIML" },
      { name: "AHARSHANA M", department: "AI & ML", classSection: "AIML" },
      { name: "DEVIKA D", department: "AI & ML", classSection: "AIML" },
      { name: "HANIYA LIYA S A", department: "AI & ML", classSection: "AIML" },
      { name: "Rivetha G", department: "IT", classSection: "IT C" },
      { name: "RAJESHWARI P", department: "IT", classSection: "IT C" },
      { name: "RIJITHA R", department: "IT", classSection: "IT C" },
      { name: "VISHALI R", department: "IT", classSection: "IT C" },
      { name: "SUBHALAKSHMI S", department: "EEE", classSection: "EEE" },
      { name: "KAYALVIZHI M", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Star Seekers",
    tribeCode: "SIP-049",
    members: [
      { name: "ANUSHKA S", department: "AI & ML", classSection: "AIML" },
      { name: "SREENIDHI V", department: "AI & ML", classSection: "AIML" },
      { name: "SINDHUJA SHREE A", department: "AI & ML", classSection: "AIML" },
      { name: "SUBATHRA L", department: "AI & ML", classSection: "AIML" },
      { name: "RUVANTHIKA M E", department: "IT", classSection: "IT C" },
      { name: "SHILPA ESTHER MARY S", department: "IT", classSection: "IT C" },
      { name: "RITHIKA S", department: "IT", classSection: "IT C" },
      { name: "VARSHA R", department: "IT", classSection: "IT C" },
      { name: "SATYA SREE P D", department: "EEE", classSection: "EEE" },
      { name: "INIYA L", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Cosmic Crusaders",
    tribeCode: "SIP-050",
    members: [
      { name: "NITHYA SREE C", department: "AI & ML", classSection: "AIML" },
      { name: "MASHKURA FATHIMA S", department: "AI & ML", classSection: "AIML" },
      { name: "BHAVANI P", department: "AI & ML", classSection: "AIML" },
      { name: "PRIYADHARSHINI G", department: "AI & ML", classSection: "AIML" },
      { name: "SHRUTHIKA S", department: "IT", classSection: "IT C" },
      { name: "RANJINI S", department: "IT", classSection: "IT C" },
      { name: "TAMIZHARASI N", department: "IT", classSection: "IT C" },
      { name: "DHARSHINI B S", department: "EEE", classSection: "EEE" },
      { name: "CHANDHANAA A", department: "EEE", classSection: "EEE" },
      { name: "KEERTHANA G", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Eclipse Elite",
    tribeCode: "SIP-051",
    members: [
      { name: "ROOBASRI M", department: "AI & ML", classSection: "AIML" },
      { name: "PONKIRUTHIKA R", department: "AI & ML", classSection: "AIML" },
      { name: "TANUSHRI S R", department: "AI & ML", classSection: "AIML" },
      { name: "VANISHRI S", department: "AI & ML", classSection: "AIML" },
      { name: "VITHIYATHARSINI K", department: "IT", classSection: "IT C" },
      { name: "YASHVI R", department: "IT", classSection: "IT C" },
      { name: "YUVASRI K", department: "IT", classSection: "IT C" },
      { name: "POOJA C", department: "EEE", classSection: "EEE" },
      { name: "SADHANA R K", department: "EEE", classSection: "EEE" },
      { name: "ANURAADHA V", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Quasar Questers",
    tribeCode: "SIP-052",
    members: [
      { name: "DIVYA DARSHINI A", department: "AI & ML", classSection: "AIML" },
      { name: "SARANYA S", department: "AI & ML", classSection: "AIML" },
      { name: "THANUSIYA VASHANTHA I", department: "IT", classSection: "IT C" },
      { name: "VAITHEESWARI S", department: "IT", classSection: "IT C" },
      { name: "SHRII GOPIKAA K", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Meteor Mavericks",
    tribeCode: "SIP-053",
    members: [
      { name: "HARIHARAN G", department: "AI & ML", classSection: "AIML" },
      { name: "MAHESWARI P", department: "AI & ML", classSection: "AIML" },
      { name: "RISHI GURUBARAN U", department: "IT", classSection: "IT C" },
      { name: "SIVA PRAKASH P", department: "IT", classSection: "IT C" },
      { name: "LOKESH Y", department: "EEE", classSection: "EEE" },
      { name: "PRABURAM P", department: "EEE", classSection: "EEE" },
    ],
  },
  {
    tribeName: "Galactic Giants",
    tribeCode: "SIP-054",
    members: [
      { name: "NAVEEN KUMAR D", department: "AI & ML", classSection: "AIML" },
      { name: "RAGHUL I", department: "AI & ML", classSection: "AIML" },
      { name: "SRI RAHUL R", department: "AI & ML", classSection: "AIML" },
      { name: "VENKATAKRISHNAN A", department: "IT", classSection: "IT C" },
      { name: "YOGESH C R", department: "IT", classSection: "IT C" },
      { name: "SANJITH S", department: "EEE", classSection: "EEE" },
      { name: "VISHAL M", department: "EEE", classSection: "EEE" },
    ],
  },
];

async function updateGroup3TribeDetails() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const group3Venue = await Venue.findOne({ groupName: "Group III" });
  if (!group3Venue) {
    console.error("Group III venue not found.");
    process.exit(1);
  }

  for (const item of GROUP3_DATA) {
    let tribe = await Tribe.findOne({ tribeCode: item.tribeCode });

    if (!tribe) {
      tribe = await Tribe.create({
        tribeCode: item.tribeCode,
        tribeName: item.tribeName,
        groupName: "Group III",
        theme: "Space & Cosmic",
        venueId: group3Venue._id,
        status: "active",
      });
      console.log(`Created new tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    } else {
      tribe.tribeName = item.tribeName;
      tribe.theme = "Space & Cosmic";
      tribe.groupName = "Group III";
      tribe.venueId = group3Venue._id;
      await tribe.save();
      console.log(`Updated tribe: ${tribe.tribeCode} -> ${tribe.tribeName}`);
    }

    // Replace members for this tribe with exact provided list
    await Member.deleteMany({ tribeId: tribe._id });
    const memberDocs = item.members.map((m) => ({
      tribeId: tribe._id,
      name: m.name,
      department: m.department || "Space & Cosmic",
      classSection: m.classSection || "",
    }));
    await Member.insertMany(memberDocs);
    console.log(`  -> Inserted ${memberDocs.length} verified members for ${tribe.tribeName} (${tribe.tribeCode})`);
  }

  console.log("All Group III tribes and member details updated successfully with clean codes.");
  await mongoose.disconnect();
}

updateGroup3TribeDetails().catch((err) => {
  console.error("Error updating Group III tribes:", err);
  process.exit(1);
});
