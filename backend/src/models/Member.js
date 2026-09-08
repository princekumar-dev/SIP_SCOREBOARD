const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    tribeId: { type: mongoose.Schema.Types.ObjectId, ref: "Tribe", required: true, index: true },
    name: { type: String, required: true, index: true },
    department: { type: String, default: "" },
    classSection: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
