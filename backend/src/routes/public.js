const express = require("express");
const mongoose = require("mongoose");
const Venue = require("../models/Venue");
const Tribe = require("../models/Tribe");
const Member = require("../models/Member");
const Event = require("../models/Event");
const Score = require("../models/Score");
const { connectDb } = require("../db");
const { buildLeaderboard, getTribeTotal } = require("../utils/ranking");
const { GROUP_MAP } = require("../constants/groups");

const router = express.Router();

const ROMAN_MAP = {
  "1": "Group I",
  "2": "Group II",
  "3": "Group III",
  "4": "Group IV",
  "5": "Group V",
  "i": "Group I",
  "ii": "Group II",
  "iii": "Group III",
  "iv": "Group IV",
  "v": "Group V",
  "group 1": "Group I",
  "group 2": "Group II",
  "group 3": "Group III",
  "group 4": "Group IV",
  "group 5": "Group V",
  "group1": "Group I",
  "group2": "Group II",
  "group3": "Group III",
  "group4": "Group IV",
  "group5": "Group V",
  "group i": "Group I",
  "group ii": "Group II",
  "group iii": "Group III",
  "group iv": "Group IV",
  "group v": "Group V",
};

async function getLeaderboardForIdentifier(param, res) {
  let venue = null;
  const trimmed = String(param || "").trim();
  const normalizedGroup = ROMAN_MAP[trimmed.toLowerCase()] || null;

  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    venue = await Venue.findById(trimmed).lean();
  }

  if (!venue && normalizedGroup) {
    venue = await Venue.findOne({ groupName: normalizedGroup }).lean();
  }

  if (!venue) {
    venue = await Venue.findOne({
      $or: [
        { groupName: new RegExp(`^${trimmed}$`, "i") },
        { location: new RegExp(trimmed, "i") },
        { theme: new RegExp(trimmed, "i") },
        { venueName: new RegExp(trimmed, "i") },
      ],
    }).lean();
  }

  const effectiveGroup = normalizedGroup || venue?.groupName || (trimmed.toLowerCase().startsWith("group") ? trimmed : null);

  let rows = [];
  if (venue) {
    rows = await buildLeaderboard({ venueId: venue._id, groupName: venue.groupName });
  } else if (effectiveGroup) {
    rows = await buildLeaderboard({ groupName: effectiveGroup });
  } else {
    rows = await buildLeaderboard();
  }

  const gInfo = venue?.groupName ? GROUP_MAP[venue.groupName] : (effectiveGroup ? GROUP_MAP[effectiveGroup] : null);

  return res.json({
    type: venue || effectiveGroup ? "venue" : "overall",
    venue: venue
      ? {
          id: String(venue._id),
          groupName: venue.groupName,
          theme: gInfo?.theme || venue.theme,
          location: venue.location,
          venueName: venue.venueName,
          participatingClasses: gInfo?.classes || venue.participatingClasses || [],
          description: gInfo?.description || venue.description,
          motif: gInfo?.motif || venue.motif,
          isAllocated: true,
        }
      : effectiveGroup
      ? {
          id: effectiveGroup,
          groupName: effectiveGroup,
          theme: gInfo?.theme || effectiveGroup,
          location: "No Venue Allocated",
          venueName: "Unallocated",
          participatingClasses: gInfo?.classes || [],
          description: gInfo?.description || "",
          motif: gInfo?.motif || "creative",
          isAllocated: false,
        }
      : null,
    lastUpdated: new Date().toISOString(),
    rows,
  });
}

router.get("/venues", async (_req, res) => {
  const venues = await Venue.find().sort({ venueName: 1 }).lean();
  const tribes = await Tribe.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: "$groupName", count: { $sum: 1 } } },
  ]);
  const groupCounts = Object.fromEntries(tribes.map((t) => [String(t._id), t.count]));
  res.json(
    venues.map((venue) => {
      const isAllocated = Boolean(venue.groupName && GROUP_MAP[venue.groupName]);
      const gInfo = isAllocated ? GROUP_MAP[venue.groupName] : null;
      return {
        id: String(venue._id),
        groupName: isAllocated ? venue.groupName : null,
        venueName: venue.venueName,
        theme: isAllocated ? gInfo.theme : "Pending Group Selection",
        location: venue.location,
        description: isAllocated
          ? gInfo.description
          : "Waiting for venue host to select and activate the currently present group.",
        motif: isAllocated ? gInfo.motif : "neutral",
        participatingClasses: isAllocated ? gInfo.classes : [],
        isLocked: venue.isLocked,
        tribeCount: isAllocated ? (groupCounts[venue.groupName] || 0) : 0,
        isAllocated,
      };
    })
  );
});

router.get("/venues/:id", async (req, res) => {
  let venue = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    venue = await Venue.findById(req.params.id).lean();
  }
  if (!venue) {
    venue = await Venue.findOne({ groupName: req.params.id }).lean();
  }
  if (!venue) return res.status(404).json({ error: "Venue not found." });

  const isAllocated = Boolean(venue.groupName && GROUP_MAP[venue.groupName]);
  const gInfo = isAllocated ? GROUP_MAP[venue.groupName] : null;
  const leaderboard = isAllocated
    ? await buildLeaderboard({ venueId: venue._id, groupName: venue.groupName })
    : [];

  res.json({
    id: String(venue._id),
    groupName: isAllocated ? venue.groupName : null,
    venueName: venue.venueName,
    theme: isAllocated ? gInfo.theme : "Pending Group Selection",
    location: venue.location,
    description: isAllocated
      ? gInfo.description
      : "Waiting for venue host to select and activate the currently present group.",
    motif: isAllocated ? gInfo.motif : "neutral",
    participatingClasses: isAllocated ? gInfo.classes : [],
    isLocked: venue.isLocked,
    tribeCount: leaderboard.length,
    isAllocated,
    lastUpdated: new Date().toISOString(),
    leaderboard,
  });
});

router.get("/leaderboard", async (req, res) => {
  const { group, groupName, venue, venueId } = req.query || {};
  const filterParam = group || groupName || venue || venueId;
  if (filterParam && filterParam !== "all") {
    return getLeaderboardForIdentifier(filterParam, res);
  }
  const rows = await buildLeaderboard();
  res.json({ type: "overall", lastUpdated: new Date().toISOString(), rows });
});

router.get("/leaderboard/venue/:id", async (req, res) => {
  return getLeaderboardForIdentifier(req.params.id, res);
});

router.get("/leaderboard/group/:id", async (req, res) => {
  return getLeaderboardForIdentifier(req.params.id, res);
});

router.get("/events", async (_req, res) => {
  const events = await Event.find().sort({ createdAt: 1 }).lean();
  res.json(
    events.map((event) => ({
      id: String(event._id),
      eventName: event.eventName,
      description: event.description,
      maximumScore: event.maximumScore,
      status: event.status,
    }))
  );
});

router.get("/tribes", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const groupName = String(req.query.groupName || req.query.group || "").trim();
  const venueId = String(req.query.venueId || "").trim();

  const filter = { status: "active" };
  if (groupName && groupName !== "all") {
    filter.groupName = groupName;
  }
  if (venueId && venueId !== "all") {
    filter.venueId = venueId;
  }

  const tribes = await Tribe.find(filter).populate("venueId").sort({ tribeCode: 1 }).lean();
  const overall = await buildLeaderboard();
  const rankMap = Object.fromEntries(overall.map((row) => [row.id, row]));

  let results = tribes.map((tribe) => ({
    id: String(tribe._id),
    tribeCode: tribe.tribeCode,
    tribeName: tribe.tribeName,
    theme: tribe.theme,
    groupName: tribe.groupName,
    venueId: tribe.venueId?._id ? String(tribe.venueId._id) : "",
    venueTheme: tribe.venueId?.theme || tribe.theme,
    location: tribe.venueId?.location || "",
    motif: tribe.venueId?.motif || "creative",
    rank: rankMap[String(tribe._id)]?.rank || null,
    totalScore: rankMap[String(tribe._id)]?.totalScore || 0,
  }));

  if (q) {
    const needle = q.toLowerCase();
    const members = await Member.find({ name: new RegExp(q, "i") }).lean();
    const memberTribeIds = new Set(members.map((m) => String(m.tribeId)));
    results = results.filter(
      (tribe) =>
        tribe.tribeName.toLowerCase().includes(needle) ||
        tribe.tribeCode.toLowerCase().includes(needle) ||
        tribe.location.toLowerCase().includes(needle) ||
        memberTribeIds.has(tribe.id)
    );
  }

  res.json(results);
});

router.get("/tribes/:id", async (req, res) => {
  const idParam = req.params.id;
  let tribe = null;
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    tribe = await Tribe.findById(idParam).populate("venueId").lean();
  }
  if (!tribe) {
    tribe = await Tribe.findOne({
      $or: [{ tribeCode: idParam.toUpperCase() }, { tribeName: new RegExp(`^${idParam}$`, "i") }],
    })
      .populate("venueId")
      .lean();
  }
  if (!tribe) return res.status(404).json({ error: "Tribe not found." });

  const [members, events, scores, overall] = await Promise.all([
    Member.find({ tribeId: tribe._id }).sort({ name: 1 }).lean(),
    Event.find().sort({ createdAt: 1 }).lean(),
    Score.find({ tribeId: tribe._id }).lean(),
    buildLeaderboard(),
  ]);
  const scoreMap = Object.fromEntries(scores.map((s) => [String(s.eventId), s]));
  const standing = overall.find((row) => row.id === String(tribe._id));
  const groupBoard = tribe.groupName ? await buildLeaderboard({ groupName: tribe.groupName }) : [];
  const groupStanding = groupBoard.find((row) => row.id === String(tribe._id));

  res.json({
    id: String(tribe._id),
    tribeCode: tribe.tribeCode,
    tribeName: tribe.tribeName,
    groupName: tribe.groupName,
    theme: tribe.theme,
    status: tribe.status,
    venue: tribe.venueId
      ? {
          id: String(tribe.venueId._id || tribe.venueId),
          theme: tribe.venueId.theme || tribe.theme,
          location: tribe.venueId.location || "No Venue Allocated",
          venueName: tribe.venueId.venueName || "Unallocated",
          motif: tribe.venueId.motif || "creative",
        }
      : {
          id: "",
          theme: tribe.theme || "Unallocated",
          location: "No Venue Allocated",
          venueName: "Unallocated",
          motif: "creative",
        },
    overallRank: standing?.rank || null,
    groupRank: groupStanding?.rank || null,
    venueRank: groupStanding?.rank || null,
    totalScore: standing?.totalScore !== undefined ? standing.totalScore : (await getTribeTotal(tribe._id)),
    events: events.map((event) => ({
      id: String(event._id),
      eventName: event.eventName,
      maximumScore: event.maximumScore,
      score: scoreMap[String(event._id)]?.score ?? null,
      remarks: scoreMap[String(event._id)]?.remarks || "",
    })),
    members: members.map((member, index) => {
      const isExplicit = /leader|team leader|\(tl\)|\(lead\)/i.test(member.name);
      const isLeader = Boolean(member.isLeader || isExplicit || index === 0);
      const cleanName = member.name.replace(/\s*\((team leader|leader|tl|lead)\)/gi, "").trim();
      return {
        id: String(member._id),
        name: cleanName,
        department: member.department,
        classSection: member.classSection,
        isLeader,
      };
    }),
  });
});

router.get("/stats", async (_req, res) => {
  const [tribes, venues, events, scores] = await Promise.all([
    Tribe.countDocuments({ status: "active" }),
    Venue.countDocuments(),
    Event.countDocuments({ status: "active" }),
    Score.countDocuments(),
  ]);
  res.json({ tribes, venues, events, scores });
});

module.exports = router;
