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

  const tribes = await Tribe.find(tribeFilter).populate("venueId").sort({ tribeCode: 1 }).lean();
  const tribeIds = tribes.map((t) => t._id);
  const scores = await Score.find({ tribeId: { $in: tribeIds } }).lean();

  const totals = new Map();
  for (const score of scores) {
    const key = String(score.tribeId);
    totals.set(key, (totals.get(key) || 0) + Number(score.score || 0));
  }

  const rows = tribes.map((tribe) => ({
    id: String(tribe._id),
    tribeCode: tribe.tribeCode,
    tribeName: tribe.tribeName,
    groupName: tribe.groupName || "",
    venueId: tribe.venueId?._id ? String(tribe.venueId._id) : (tribe.venueId ? String(tribe.venueId) : ""),
    venueName: tribe.venueId?.venueName || "Unallocated",
    venueTheme: tribe.venueId?.theme || tribe.theme,
    location: tribe.venueId?.location || "No Venue Allocated",
    motif: tribe.venueId?.motif || "creative",
    totalScore: totals.get(String(tribe._id)) || 0,
  }));

  return assignRanks(rows);
}

async function getTribeTotal(tribeId) {
  const scores = await Score.find({ tribeId }).lean();
  return scores.reduce((sum, item) => sum + Number(item.score || 0), 0);
}

module.exports = { assignRanks, buildLeaderboard, getTribeTotal };
