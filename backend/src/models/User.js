const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "coordinator", "venue_host"],
      required: true,
    },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", default: null },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
