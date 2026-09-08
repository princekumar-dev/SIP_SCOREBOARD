const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    tribeId: { type: mongoose.Schema.Types.ObjectId, ref: "Tribe", required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    score: { type: Number, required: true, min: 0 },
    remarks: { type: String, default: "" },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

scoreSchema.index({ tribeId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("Score", scoreSchema);
