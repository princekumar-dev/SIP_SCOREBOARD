const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    groupName: { type: String, default: null },
    venueName: { type: String, required: true },
    theme: { type: String, default: "Pending Group Selection" },
    location: { type: String, required: true },
    description: { type: String, default: "" },
    motif: { type: String, default: "creative" },
    participatingClasses: { type: [String], default: [] },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Venue", venueSchema);
