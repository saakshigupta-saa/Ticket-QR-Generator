const express = require("express");
const cors = require("cors");
const path = require("path");

const ticketRoutes = require("./routes/ticketRoutes");

const app = express();


// =================================
// MIDDLEWARE
// =================================

app.use(cors());

app.use(express.json());


// =================================
// FRONTEND
// =================================

app.use(
  express.static(
    path.join(__dirname, "client")
  )
);


// =================================
// HEALTH CHECK
// =================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});


// =================================
// TICKET API
// =================================

app.use(
  "/api/tickets",
  ticketRoutes
);


// =================================
// FRONTEND FALLBACK
// =================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "client",
      "index.html"
    )
  );
});


module.exports = app;