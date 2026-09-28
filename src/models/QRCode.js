const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      unique: true,
    },

    qrIdentifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    payload: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED"],
      default: "ACTIVE",
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);