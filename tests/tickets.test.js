require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../src/app");
const Ticket = require("../src/models/Ticket");
const QRCode = require("../src/models/QRCode");

const userId = "550e8400-e29b-41d4-a716-446655440000";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
}, 30000);

beforeEach(async () => {
  await QRCode.deleteMany({});
  await Ticket.deleteMany({});
});

afterAll(async () => {
  await QRCode.deleteMany({});
  await Ticket.deleteMany({});
  await mongoose.connection.close();
}, 30000);

describe("Ticket API", () => {
  // -----------------------------
  // CREATE TICKET
  // -----------------------------

  test("should create a new ticket", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "Printer issue on Floor 2",
        description: "Printer is not responding",
        priority: "HIGH",
        createdBy: userId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("ticketNumber");
    expect(response.body.title).toBe("Printer issue on Floor 2");
    expect(response.body.priority).toBe("HIGH");
  });

  test("should reject a ticket with an empty title", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "",
        description: "Printer is not responding",
        priority: "HIGH",
        createdBy: userId,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Ticket title is required");
  });

  test("should reject an invalid ticket priority", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "Printer issue",
        description: "Printer is not responding",
        priority: "URGENT",
        createdBy: userId,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Invalid ticket priority");
  });

  test("should reject a ticket without createdBy", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "Missing Creator Test",
        description: "Testing missing creator",
        priority: "HIGH",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("CreatedBy is required");
  });

  test("should reject a ticket with an invalid createdBy", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "Invalid Creator Test",
        description: "Testing invalid creator",
        priority: "HIGH",
        createdBy: "invalid-user-id",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Invalid createdBy");
  });

  // -----------------------------
  // GET TICKETS
  // -----------------------------

  test("should return all tickets", async () => {
    const response = await request(app).get("/api/tickets");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("should return 404 for a ticket that does not exist", async () => {
    const response = await request(app).get(
      `/api/tickets/${userId}`
    );

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Ticket not found");
  });

  // -----------------------------
  // UPDATE TICKET
  // -----------------------------

  test("should update a ticket status", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "Status Update Test",
        description: "Testing ticket status update",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .send({
        status: "IN_PROGRESS",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("IN_PROGRESS");
  });

  test("should reject an invalid ticket status", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "Invalid Status Test",
        description: "Testing invalid status",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .send({
        status: "INVALID_STATUS",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Invalid ticket status");
  });

  test("should return 404 when updating a ticket that does not exist", async () => {
    const response = await request(app)
      .put(`/api/tickets/${userId}`)
      .send({
        status: "IN_PROGRESS",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Ticket not found");
  });

  // -----------------------------
  // QR GENERATION
  // -----------------------------

  test("should generate a QR code for a ticket", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "QR Test Ticket",
        description: "Testing QR generation",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    const response = await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("qrIdentifier");
    expect(response.body).toHaveProperty("payload");
  });

  test("should return the existing QR code when generating QR again", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "QR Reuse Test",
        description: "Testing QR reuse",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    const firstResponse = await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    const secondResponse = await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body.qrIdentifier).toBe(
      firstResponse.body.qrIdentifier
    );
  });

  test("should return 404 when generating QR for a missing ticket", async () => {
    const response = await request(app)
      .post(`/api/tickets/${userId}/qr`)
      .send({
        userId,
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Ticket not found");
  });

  test("should return the QR code after it has been generated", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "Get QR Test",
        description: "Testing QR retrieval",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    const response = await request(app).get(
      `/api/tickets/${ticketId}/qr`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("qrIdentifier");
    expect(response.body.status).toBe("ACTIVE");
  });

  test("should return 404 when getting a QR code that does not exist", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "Missing QR Test",
        description: "Testing missing QR",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    const response = await request(app).get(
      `/api/tickets/${ticketId}/qr`
    );

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("QR code not found");
  });

  // -----------------------------
  // QR REVOKE
  // -----------------------------

  test("should revoke an active QR code", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "QR Revoke Test",
        description: "Testing QR revocation",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    const response = await request(app)
      .post(`/api/tickets/${ticketId}/qr/revoke`)
      .send({
        userId,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("REVOKED");
  });

  test("should return 404 when revoking a QR code that does not exist", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "Missing Revoke QR Test",
        description: "Testing missing QR revoke",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    const response = await request(app)
      .post(`/api/tickets/${ticketId}/qr/revoke`)
      .send({
        userId,
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("QR code not found");
  });

  test("should reactivate a revoked QR code when generated again", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "QR Reactivation Test",
        description: "Testing QR reactivation",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    const firstResponse = await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    await request(app)
      .post(`/api/tickets/${ticketId}/qr/revoke`)
      .send({
        userId,
      });

    const response = await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.qrIdentifier).toBe(
      firstResponse.body.qrIdentifier
    );
    expect(response.body.status).toBe("ACTIVE");
  });

  // -----------------------------
  // VALIDATION
  // -----------------------------

  test("should reject a ticket title longer than 100 characters", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "A".repeat(101),
        description: "Testing long title",
        priority: "HIGH",
        createdBy: userId,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "Ticket title must be 100 characters or less"
    );
  });

  test("should reject a description longer than 1000 characters", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "Long Description Test",
        description: "A".repeat(1001),
        priority: "HIGH",
        createdBy: userId,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "Ticket description must be 1000 characters or less"
    );
  });

  // -----------------------------
  // XSS SECURITY
  // -----------------------------

  test("should sanitize XSS content from ticket title", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: '<script>alert("XSS")</script>Printer Issue',
        description: "Printer problem",
        priority: "HIGH",
        createdBy: userId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).not.toContain("<script>");
    expect(response.body.title).not.toContain("</script>");
  });

  test("should sanitize XSS content from ticket description", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        title: "Printer Issue",
        description: '<script>alert("XSS")</script>Printer problem',
        priority: "HIGH",
        createdBy: userId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.description).not.toContain("<script>");
    expect(response.body.description).not.toContain("</script>");
  });

  // -----------------------------
  // EDGE CASES
  // -----------------------------

  test("should return 404 when revoking QR for a missing ticket", async () => {
    const response = await request(app)
      .post(`/api/tickets/${userId}/qr/revoke`)
      .send({
        userId,
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Ticket not found");
  });

  test("should not create a duplicate QR code for repeated generation", async () => {
    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "Duplicate QR Test",
        description: "Testing duplicate QR generation",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    const firstResponse = await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    const secondResponse = await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body.qrIdentifier).toBe(
      firstResponse.body.qrIdentifier
    );
  });

  // -----------------------------
  // TELEMETRY
  // -----------------------------

  test("should log telemetry when a QR code is generated", async () => {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const createResponse = await request(app)
      .post("/api/tickets")
      .send({
        title: "Telemetry Test",
        description: "Testing telemetry",
        priority: "HIGH",
        createdBy: userId,
      });

    const ticketId = createResponse.body.id;

    await request(app)
      .post(`/api/tickets/${ticketId}/qr`)
      .send({
        userId,
      });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[Analytics] User interacted with Ticket QR Code Generator Worker"
    );

    consoleSpy.mockRestore();
  });
});