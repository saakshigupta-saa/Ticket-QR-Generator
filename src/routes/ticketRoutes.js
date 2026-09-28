const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");
const QRCode = require("../models/QRCode");

const router = express.Router();

const VALID_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const VALID_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const sanitizeText = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    )
    .replace(/<[^>]*>/g, "")
    .trim();
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const logAnalytics = () => {
  console.log(
    "[Analytics] User interacted with Ticket QR Code Generator Worker"
  );
};

// CREATE TICKET
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      createdBy,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Ticket title is required",
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        error: "Ticket title must be 100 characters or less",
      });
    }

    if (
      description &&
      typeof description === "string" &&
      description.trim().length > 1000
    ) {
      return res.status(400).json({
        error:
          "Ticket description must be 1000 characters or less",
      });
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: "Invalid ticket priority",
      });
    }

    if (!createdBy) {
      return res.status(400).json({
        error: "CreatedBy is required",
      });
    }

    if (!UUID_REGEX.test(createdBy)) {
      return res.status(400).json({
        error: "Invalid createdBy",
      });
    }

    const sanitizedTitle = sanitizeText(title);
    const sanitizedDescription = sanitizeText(
      description || ""
    );

    const ticket = await Ticket.create({
      ticketNumber: `TKT-${Date.now()}-${crypto
        .randomBytes(3)
        .toString("hex")}`,
      title: sanitizedTitle,
      description: sanitizedDescription,
      priority,
      createdBy,
    });

    logAnalytics();

    return res.status(201).json({
      id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      createdBy: ticket.createdBy,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    });
  } catch (error) {
    console.error("Create ticket error:", error.message);

    return res.status(500).json({
      error: "Failed to create ticket",
    });
  }
});

// GET ALL TICKETS
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(
      tickets.map((ticket) => ({
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        createdBy: ticket.createdBy,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Get tickets error:", error.message);

    return res.status(500).json({
      error: "Failed to retrieve tickets",
    });
  }
});

// GET SINGLE TICKET
router.get("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    return res.status(200).json({
      id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      createdBy: ticket.createdBy,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    });
  } catch (error) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }
});

// UPDATE TICKET STATUS
router.put("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: "Invalid ticket status",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    logAnalytics();

    return res.status(200).json({
      id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      createdBy: ticket.createdBy,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    });
  } catch (error) {
    console.error("Update ticket error:", error.message);

    return res.status(500).json({
      error: "Failed to update ticket",
    });
  }
});

// GENERATE / REUSE QR
router.post("/:id/qr", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const existingQRCode = await QRCode.findOne({
      ticketId: ticket._id,
    });

    // Existing active QR
    if (
      existingQRCode &&
      existingQRCode.status === "ACTIVE"
    ) {
      return res.status(200).json(existingQRCode);
    }

    // Existing revoked QR → reactivate
    if (
      existingQRCode &&
      existingQRCode.status === "REVOKED"
    ) {
      existingQRCode.status = "ACTIVE";
      existingQRCode.updatedAt = new Date();

      await existingQRCode.save();

      logAnalytics();

      return res.status(200).json(existingQRCode);
    }

    // Create first QR
    const qrCode = await QRCode.create({
      ticketId: ticket._id,
      qrIdentifier: `QR-${crypto.randomUUID()}`,
      payload: JSON.stringify({
        ticketNumber: ticket.ticketNumber,
        ticketId: ticket._id,
      }),
      status: "ACTIVE",
    });

    logAnalytics();

    return res.status(201).json(qrCode);
  } catch (error) {
    console.error("QR generation error:", error.message);

    return res.status(500).json({
      error: "Failed to generate QR code",
    });
  }
});

// GET QR
router.get("/:id/qr", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const qrCode = await QRCode.findOne({
      ticketId: ticket._id,
    });

    if (!qrCode) {
      return res.status(404).json({
        error: "QR code not found",
      });
    }

    return res.status(200).json(qrCode);
  } catch (error) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }
});

// REVOKE QR
router.post("/:id/qr/revoke", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    const qrCode = await QRCode.findOne({
      ticketId: ticket._id,
    });

    if (!qrCode) {
      return res.status(404).json({
        error: "QR code not found",
      });
    }

    qrCode.status = "REVOKED";
    qrCode.updatedAt = new Date();

    await qrCode.save();

    logAnalytics();

    return res.status(200).json(qrCode);
  } catch (error) {
    console.error("QR revoke error:", error.message);

    return res.status(500).json({
      error: "Failed to revoke QR code",
    });
  }
});

module.exports = router;