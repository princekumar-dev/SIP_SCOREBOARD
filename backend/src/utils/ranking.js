const Venue = require("../models/Venue");
const Tribe = require("../models/Tribe");
const Score = require("../models/Score");

function assignRanks(rows) {
  const sorted = [...rows].sort((a, b) => b.totalScore - a.totalScore || a.tribeCode.localeCompare(b.tribeCode));
  let currentRank = 0;
  let prevScore = null;
  return sorted.map((row, index) => {
    if (row.totalScore === 0 || row.totalScore === null) {
      return { ...row, rank: null };
    }
    if (row.totalScore !== prevScore) {
      currentRank = index + 1;
      prevScore = row.totalScore;
    }
    return { ...row, rank: currentRank };
  });
}

async function buildLeaderboard({ venueId, groupName } = {}) {
  const tribeFilter = { status: "active" };
  if (groupName) {
    tribeFilter.groupName = groupName;
  } else if (venueId) {
    tribeFilter.venueId = venueId;
  }

  const [tribes, allVenues] = await Promise.all([
    Tribe.find(tribeFilter).sort({ tribeCode: 1 }).lean(),
    Venue.find().lean(),
  ]);

  const groupToVenueMap = new Map();
  for (const v of allVenues) {
    if (v.groupName) {
      groupToVenueMap.set(v.groupName.toLowerCase(), v);
    }
  }

  const tribeIds = tribes.map((t) => t._id);
  const scores = await Score.find({ tribeId: { $in: tribeIds } }).lean();

  const totals = new Map();
  for (const score of scores) {
    const key = String(score.tribeId);
    totals.set(key, (totals.get(key) || 0) + Number(score.score || 0));
  }

  const { GROUP_MAP } = require("../constants/groups");

  const rows = tribes.map((tribe) => {
    const gInfo = tribe.groupName ? GROUP_MAP[tribe.groupName] : null;
    const assignedVenue = tribe.groupName ? groupToVenueMap.get(tribe.groupName.toLowerCase()) : null;
    const themeName = tribe.theme || gInfo?.theme || assignedVenue?.theme || "";
    return {
      id: String(tribe._id),
      tribeCode: tribe.tribeCode,
      tribeName: tribe.tribeName,
      groupName: tribe.groupName || "",
      theme: themeName,
      venueId: assignedVenue ? String(assignedVenue._id) : "",
      venueName: assignedVenue ? assignedVenue.venueName : "Unallocated",
      venueTheme: assignedVenue?.theme || themeName,
      location: assignedVenue ? assignedVenue.location : "No Venue Allocated",
      motif: assignedVenue?.motif || gInfo?.motif || "creative",
      totalScore: totals.get(String(tribe._id)) || 0,
    };
  });

  return assignRanks(rows);
}

async function getTribeTotal(tribeId) {
  const scores = await Score.find({ tribeId }).lean();
  return scores.reduce((sum, item) => sum + Number(item.score || 0), 0);
}

module.exports = { assignRanks, buildLeaderboard, getTribeTotal };
