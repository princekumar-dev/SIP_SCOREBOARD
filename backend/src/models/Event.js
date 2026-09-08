const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    description: { type: String, default: "" },
    maximumScore: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["draft", "active", "completed"], default: "active" },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
