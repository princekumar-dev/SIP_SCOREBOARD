const express = require("express");
const bcrypt = require("bcryptjs");
const Venue = require("../models/Venue");
const Tribe = require("../models/Tribe");
const Member = require("../models/Member");
const Event = require("../models/Event");
const Score = require("../models/Score");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { requireAuth, requireRoles, canAccessVenue, publicUser } = require("../middleware/auth");
const { writeAudit } = require("../utils/audit");
const { broadcast } = require("../utils/realtime");
const { buildLeaderboard, getTribeTotal } = require("../utils/ranking");

const router = express.Router();

router.use(requireAuth);

router.get("/me", async (req, res) => {
  const user = await User.findById(req.user._id).populate("venueId").lean();
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    venueId: user.venueId ? String(user.venueId._id || user.venueId) : null,
    venue: user.venueId
      ? {
          id: String(user.venueId._id),
          groupName: user.venueId.groupName,
          venueName: user.venueId.venueName,
          theme: user.venueId.theme,
          location: user.venueId.location,
          participatingClasses: user.venueId.participatingClasses || [],
        }
      : null,
    status: user.status,
  });
});

router.get("/scores/matrix", async (req, res) => {
  const { venueId, groupName, eventId } = req.query || {};
  if (!eventId) {
    return res.status(400).json({ error: "eventId is required." });
  }

  const filter = { status: "active" };
  if (groupName) {
    filter.groupName = groupName;
  } else if (venueId) {
    filter.venueId = venueId;
  }

  const tribes = await Tribe.find(filter).populate("venueId").sort({ tribeCode: 1 }).lean();
  const tribeIds = tribes.map((t) => t._id);
  const scores = await Score.find({ tribeId: { $in: tribeIds }, eventId }).lean();
  const scoreMap = Object.fromEntries(scores.map((s) => [String(s.tribeId), s]));
  const allScores = await Score.find({ tribeId: { $in: tribeIds } }).lean();
  const totals = new Map();
  for (const s of allScores) {
    const k = String(s.tribeId);
    totals.set(k, (totals.get(k) || 0) + Number(s.score || 0));
  }

  const items = tribes.map((tribe) => ({
    tribeId: String(tribe._id),
    tribeCode: tribe.tribeCode,
    tribeName: tribe.tribeName,
    groupName: tribe.groupName,
    theme: tribe.theme,
    currentVenue: tribe.venueId?.location || "",
    currentVenueName: tribe.venueId?.venueName || "",
    currentScore: scoreMap[String(tribe._id)]?.score ?? null,
    remarks: scoreMap[String(tribe._id)]?.remarks || "",
    totalScore: totals.get(String(tribe._id)) || 0,
  }));

  res.json({ tribes: items });
});

const GROUP_MAP = {
  "Group I": { theme: "Creative & Design", motif: "creative", classes: ["AI & DS – A", "CSE – A", "Civil"] },
  "Group II": { theme: "Technology & Innovation", motif: "tech", classes: ["Cyber Security", "AI & DS – B", "IT – A"] },
  "Group III": { theme: "Space & Cosmic", motif: "space", classes: ["AI & ML", "IT – C", "EEE"] },
  "Group IV": { theme: "Legends & Mythology", motif: "legend", classes: ["ECE – A", "CSE – B", "MECH"] },
  "Group V": { theme: "Power & Energy", motif: "energy", classes: ["ECE – B", "CSE – C", "IT – B"] },
};

async function ensureVenueGroupSync() {
  const venues = await Venue.find().sort({ venueName: 1 }).lean();
  if (venues.length === 5) {
    const defaultGroupOrder = ["Group I", "Group II", "Group III", "Group IV", "Group V"];
    const groupCount = {};
    venues.forEach((v) => {
      if (v.groupName) groupCount[v.groupName] = (groupCount[v.groupName] || 0) + 1;
    });
    const hasDuplicate = Object.values(groupCount).some((cnt) => cnt > 1);

    if (hasDuplicate) {
      for (let i = 0; i < venues.length; i++) {
        const v = venues[i];
        const gName = defaultGroupOrder[i];
        if (gName && GROUP_MAP[gName]) {
          await Venue.findByIdAndUpdate(v._id, {
            groupName: gName,
            theme: GROUP_MAP[gName].theme,
            motif: GROUP_MAP[gName].motif,
            participatingClasses: GROUP_MAP[gName].classes,
          });
          await Tribe.updateMany({ groupName: gName }, { $set: { venueId: v._id } });
        }
      }
    } else {
      for (const v of venues) {
        if (v.groupName) {
          await Tribe.updateMany({ groupName: v.groupName }, { $set: { venueId: v._id } });
        }
      }
    }
  }
}

router.put("/groups/assign-venue", async (req, res) => {
  const { groupName, venueId } = req.body || {};
  if (!groupName || !venueId) {
    return res.status(400).json({ error: "groupName and venueId are required." });
  }
  const targetVenue = await Venue.findById(venueId);
  if (!targetVenue) return res.status(404).json({ error: "Venue not found." });

  // Find where this group was currently located
  const currentVenueOfGroup = await Venue.findOne({ groupName });
  const prevGroupAtTargetVenue = targetVenue.groupName;

  // Perform clean 1-to-1 swap if another group is occupying target venue
  if (
    currentVenueOfGroup &&
    String(currentVenueOfGroup._id) !== String(targetVenue._id) &&
    prevGroupAtTargetVenue &&
    prevGroupAtTargetVenue !== groupName
  ) {
    await Tribe.updateMany(
      { groupName: prevGroupAtTargetVenue },
      { $set: { venueId: currentVenueOfGroup._id } }
    );
    if (GROUP_MAP[prevGroupAtTargetVenue]) {
      currentVenueOfGroup.groupName = prevGroupAtTargetVenue;
      currentVenueOfGroup.theme = GROUP_MAP[prevGroupAtTargetVenue].theme;
      currentVenueOfGroup.motif = GROUP_MAP[prevGroupAtTargetVenue].motif;
      currentVenueOfGroup.participatingClasses = GROUP_MAP[prevGroupAtTargetVenue].classes;
      await currentVenueOfGroup.save();
    }
    broadcast(req, { kind: "venue-move", groupName: prevGroupAtTargetVenue, venueId: String(currentVenueOfGroup._id) });
  }

  // Assign groupName to targetVenue
  const result = await Tribe.updateMany(
    { groupName },
    { $set: { venueId: targetVenue._id } }
  );

  if (GROUP_MAP[groupName]) {
    targetVenue.groupName = groupName;
    targetVenue.theme = GROUP_MAP[groupName].theme;
    targetVenue.motif = GROUP_MAP[groupName].motif;
    targetVenue.participatingClasses = GROUP_MAP[groupName].classes;
    await targetVenue.save();
  }

  await writeAudit(req, {
    action: "group.venue_reassigned",
    entityType: "group",
    entityId: targetVenue._id,
    newValue: { groupName, venueId: String(targetVenue._id), venueLocation: targetVenue.location, participatingClasses: targetVenue.participatingClasses },
    reason: req.body.reason || "Group venue rotation",
  });

  broadcast(req, { kind: "venue-move", groupName, venueId: String(targetVenue._id) });
  broadcast(req, { kind: "leaderboard" });
  res.json({
    ok: true,
    updatedCount: result.modifiedCount,
    groupName,
    venueLocation: targetVenue.location,
    participatingClasses: targetVenue.participatingClasses,
  });
});

router.get("/dashboard", async (req, res) => {
  await ensureVenueGroupSync();
  const [tribes, venues, events, scores, recent, venueList, leaderboard] = await Promise.all([
    Tribe.countDocuments(),
    Venue.countDocuments(),
    Event.countDocuments({ status: "active" }),
    Score.countDocuments(),
    AuditLog.find().sort({ createdAt: -1 }).limit(12).populate("userId").lean(),
    Venue.find().sort({ groupName: 1 }).lean(),
    buildLeaderboard(),
  ]);

  const counts = await Tribe.aggregate([{ $group: { _id: "$venueId", count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  let hostData = null;
  if (req.user && req.user.venueId) {
    const hostVenue = venueList.find((v) => String(v._id) === String(req.user.venueId));
    if (hostVenue) {
      const hostTribes = await Tribe.find({ venueId: hostVenue._id }).lean();
      const hostTribeIds = hostTribes.map((t) => t._id);
      const hostScoresCount = await Score.countDocuments({ tribeId: { $in: hostTribeIds } });
      const hostLeaderboard = await buildLeaderboard({ venueId: hostVenue._id });

      hostData = {
        venueId: String(hostVenue._id),
        groupName: hostVenue.groupName,
        venueName: hostVenue.venueName,
        theme: hostVenue.theme,
        location: hostVenue.location,
        motif: hostVenue.motif,
        participatingClasses: hostVenue.participatingClasses || [],
        description: hostVenue.description || "",
        isLocked: hostVenue.isLocked,
        tribeCount: hostTribes.length,
        scoresCount: hostScoresCount,
        totalExpectedScores: hostTribes.length * events,
        topTribes: hostLeaderboard.slice(0, 5),
      };
    }
  }

  res.json({
    cards: { tribes, venues, events, scores },
    venues: venueList.map((venue) => ({
      id: String(venue._id),
      groupName: venue.groupName,
      venueName: venue.venueName,
      theme: venue.theme,
      location: venue.location,
      motif: venue.motif,
      participatingClasses: venue.participatingClasses || [],
      isLocked: venue.isLocked,
      tribeCount: countMap[String(venue._id)] || 0,
    })),
    hostData,
    recent: recent.map((log) => ({
      id: String(log._id),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      reason: log.reason,
      user: log.userId?.name || "System",
      createdAt: log.createdAt,
    })),
    topTribes: leaderboard.slice(0, 5),
    user: publicUser(req.user),
  });
});

router.get("/tribes", async (req, res) => {
  const { groupName, venueId } = req.query || {};
  let filter = {};
  if (req.user.role !== "super_admin") {
    if (req.user.venueId) {
      const userVenue = await Venue.findById(req.user.venueId).lean();
      if (userVenue && userVenue.groupName) {
        filter.groupName = userVenue.groupName;
      } else {
        filter.venueId = req.user.venueId;
      }
    }
  } else {
    if (groupName && groupName !== "all") filter.groupName = groupName;
    if (venueId && venueId !== "all") filter.venueId = venueId;
  }
  const rows = await buildLeaderboard(filter);
  res.json(rows);
});

router.post("/tribes", requireRoles("super_admin"), async (req, res) => {
  const { tribeCode, tribeName, venueId, members = [] } = req.body || {};
  if (!tribeCode || !tribeName || !venueId) {
    return res.status(400).json({ error: "Tribe code, name and venue are required." });
  }
  const venue = await Venue.findById(venueId);
  if (!venue) return res.status(404).json({ error: "Venue not found." });

  const tribe = await Tribe.create({
    tribeCode: tribeCode.toUpperCase(),
    tribeName,
    venueId: venue._id,
    theme: venue.theme,
    status: "active",
  });
  if (members.length) {
    await Member.insertMany(members.filter((m) => m.name).map((m) => ({ ...m, tribeId: tribe._id })));
  }
  await writeAudit(req, {
    action: "tribe.created",
    entityType: "tribe",
    entityId: tribe._id,
    newValue: { tribeCode, tribeName, venueId },
  });
  broadcast(req, { kind: "tribe" });
  res.status(201).json({ id: String(tribe._id) });
});

router.put("/tribes/:id", requireRoles("super_admin", "coordinator"), async (req, res) => {
  const tribe = await Tribe.findById(req.params.id);
  if (!tribe) return res.status(404).json({ error: "Tribe not found." });
  const oldValue = { tribeName: tribe.tribeName, status: tribe.status };
  if (req.body.tribeName) tribe.tribeName = req.body.tribeName;
  if (req.body.status) tribe.status = req.body.status;
  await tribe.save();
  await writeAudit(req, {
    action: "tribe.edited",
    entityType: "tribe",
    entityId: tribe._id,
    oldValue,
    newValue: { tribeName: tribe.tribeName, status: tribe.status },
  });
  broadcast(req, { kind: "tribe" });
  res.json({ ok: true });
});

router.put("/tribes/:id/venue", requireRoles("super_admin"), async (req, res) => {
  const tribe = await Tribe.findById(req.params.id);
  if (!tribe) return res.status(404).json({ error: "Tribe not found." });
  const venue = await Venue.findById(req.body.venueId);
  if (!venue) return res.status(404).json({ error: "Venue not found." });
  const currentVenue = await Venue.findById(tribe.venueId);
  if (currentVenue?.isLocked || venue.isLocked) {
    return res.status(409).json({ error: "Venue assignment is locked. Unlock it before moving a tribe." });
  }
  const oldVenue = String(tribe.venueId);
  tribe.venueId = venue._id;
  tribe.theme = venue.theme;
  await tribe.save();
  await writeAudit(req, {
    action: "tribe.venue_changed",
    entityType: "tribe",
    entityId: tribe._id,
    oldValue: { venueId: oldVenue },
    newValue: { venueId: String(venue._id) },
    reason: req.body.reason || "Venue reassignment",
  });
  broadcast(req, { kind: "venue-move", tribeId: String(tribe._id) });
  res.json({ ok: true, totalScore: await getTribeTotal(tribe._id) });
});

router.delete("/tribes/:id", requireRoles("super_admin"), async (req, res) => {
  const tribe = await Tribe.findById(req.params.id);
  if (!tribe) return res.status(404).json({ error: "Tribe not found." });
  await Member.deleteMany({ tribeId: tribe._id });
  await Score.deleteMany({ tribeId: tribe._id });
  await tribe.deleteOne();
  await writeAudit(req, { action: "tribe.deleted", entityType: "tribe", entityId: req.params.id });
  broadcast(req, { kind: "tribe" });
  res.json({ ok: true });
});

router.get("/venues", async (_req, res) => {
  const venues = await Venue.find().sort({ groupName: 1 }).lean();
  res.json(
    venues.map((venue) => ({
      id: String(venue._id),
      groupName: venue.groupName,
      venueName: venue.venueName,
      theme: venue.theme,
      location: venue.location,
      isLocked: venue.isLocked,
    }))
  );
});

router.put("/venues/:id/lock", requireRoles("super_admin"), async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) return res.status(404).json({ error: "Venue not found." });
  const old = venue.isLocked;
  venue.isLocked = Boolean(req.body.isLocked);
  await venue.save();
  await writeAudit(req, {
    action: venue.isLocked ? "venue.locked" : "venue.unlocked",
    entityType: "venue",
    entityId: venue._id,
    oldValue: { isLocked: old },
    newValue: { isLocked: venue.isLocked },
  });
  res.json({ id: String(venue._id), isLocked: venue.isLocked });
});

router.get("/events", async (_req, res) => {
  const events = await Event.find().sort({ createdAt: 1 }).lean();
  res.json(events.map((event) => ({ ...event, id: String(event._id) })));
});

router.post("/events", requireRoles("super_admin"), async (req, res) => {
  const { eventName, description, maximumScore, status } = req.body || {};
  if (!eventName || !maximumScore) return res.status(400).json({ error: "Event name and maximum score are required." });
  const event = await Event.create({
    eventName,
    description: description || "",
    maximumScore: Number(maximumScore),
    status: status || "active",
  });
  await writeAudit(req, { action: "event.created", entityType: "event", entityId: event._id, newValue: req.body });
  broadcast(req, { kind: "event" });
  res.status(201).json({ id: String(event._id) });
});

router.put("/events/:id", requireRoles("super_admin"), async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found." });
  const oldValue = event.toObject();
  ["eventName", "description", "status"].forEach((key) => {
    if (req.body[key] !== undefined) event[key] = req.body[key];
  });
  if (req.body.maximumScore !== undefined) event.maximumScore = Number(req.body.maximumScore);
  await event.save();
  await writeAudit(req, { action: "event.edited", entityType: "event", entityId: event._id, oldValue, newValue: event.toObject() });
  broadcast(req, { kind: "event" });
  res.json({ ok: true });
});

router.post("/scores", async (req, res) => {
  const { tribeId, eventId, score, remarks, reason } = req.body || {};
  if (!tribeId || !eventId || score === undefined || score === null) {
    return res.status(400).json({ error: "Tribe, event and score are required." });
  }
  const numeric = Number(score);
  if (Number.isNaN(numeric)) return res.status(400).json({ error: "Score must be numeric." });
  if (numeric < 0) return res.status(400).json({ error: "Score cannot be negative." });

  const [tribe, event] = await Promise.all([Tribe.findById(tribeId), Event.findById(eventId)]);
  if (!tribe) return res.status(404).json({ error: "Tribe not found." });
  if (!event) return res.status(404).json({ error: "Event not found." });
  if (!canAccessVenue(req.user, tribe.venueId)) {
    return res.status(403).json({ error: "You do not have permission to update this venue." });
  }
  if (numeric > event.maximumScore) {
    return res.status(400).json({ error: `Score must be between 0 and ${event.maximumScore}.` });
  }

  const existing = await Score.findOne({ tribeId: tribe._id, eventId: event._id });
  const oldValue = existing ? { score: existing.score } : null;
  const saved = await Score.findOneAndUpdate(
    { tribeId: tribe._id, eventId: event._id },
    {
      tribeId: tribe._id,
      eventId: event._id,
      score: numeric,
      remarks: remarks || "",
      enteredBy: req.user._id,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await writeAudit(req, {
    action: existing ? "score.updated" : "score.created",
    entityType: "score",
    entityId: saved._id,
    oldValue,
    newValue: { score: numeric, tribeId, eventId },
    reason: reason || remarks || "",
  });
  broadcast(req, { kind: "score", tribeId: String(tribe._id), venueId: String(tribe.venueId) });
  res.json({ ok: true, id: String(saved._id), totalScore: await getTribeTotal(tribe._id) });
});

router.get("/audit", requireRoles("super_admin", "coordinator"), async (_req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).populate("userId").lean();
  res.json(
    logs.map((log) => ({
      id: String(log._id),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      oldValue: log.oldValue,
      newValue: log.newValue,
      reason: log.reason,
      user: log.userId?.name || "System",
      createdAt: log.createdAt,
    }))
  );
});

router.get("/users", requireRoles("super_admin"), async (_req, res) => {
  const users = await User.find().populate("venueId").sort({ createdAt: 1 }).lean();
  res.json(
    users.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      venueTheme: user.venueId?.theme || "All venues",
    }))
  );
});

router.post("/users", requireRoles("super_admin"), async (req, res) => {
  const { name, email, password, role, venueId } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Name, email, password and role are required." });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: String(email).toLowerCase(),
    passwordHash,
    role,
    venueId: venueId || null,
    status: "active",
  });
  await writeAudit(req, { action: "user.created", entityType: "user", entityId: user._id, newValue: { email, role } });
  res.status(201).json({ id: String(user._id) });
});

module.exports = router;
