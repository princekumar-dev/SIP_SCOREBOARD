const mongoose = require("mongoose");

const tribeSchema = new mongoose.Schema(
  {
    tribeCode: { type: String, required: true, unique: true, index: true },
    tribeName: { type: String, required: true, index: true },
    groupName: { type: String, required: true, index: true }, // e.g. "Group I", "Group II", ...
    theme: { type: String, required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true, index: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tribe", tribeSchema);
