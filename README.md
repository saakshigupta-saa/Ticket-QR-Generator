# 🎟️ Ticket QR Code Generator Worker

A full-stack **Ticket QR Code Generator Worker** designed to digitize ticket creation and QR-code management for floor staff.

The system replaces manual paper/Excel-based ticket workflows with a structured digital workflow for **creating tickets, generating QR codes, reusing QR codes, revoking QR codes, and managing ticket status**.

---

## 🚀 Project Overview

The Ticket QR Code Generator Worker provides a simple interface for floor staff to create and manage tickets and generate QR codes for fast check-in operations.

### Core capabilities

* 🎫 Create tickets
* 📋 View recent tickets
* 🔳 Generate QR codes
* ♻️ Reuse existing QR codes
* 🚫 Revoke QR codes
* 🔄 Reactivate revoked QR codes
* 🛡️ Input validation and sanitization
* 📡 Loading states for asynchronous operations
* ♿ Accessibility-focused interface
* 📊 Simulated telemetry
* 🗄️ MongoDB persistence
* 🧪 Automated API testing

---

## ✨ Features

### Ticket Management

Create tickets with:

* Ticket title
* Description
* Priority
* Ticket status
* Creator information
* Automatically generated ticket number

Supported priorities:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Supported statuses:

```text
OPEN
IN_PROGRESS
RESOLVED
CLOSED
```

---

### QR Code Management

Each ticket can have one current QR code.

QR lifecycle:

```text
No QR
  ↓
Generate
  ↓
ACTIVE
  ↓
Revoke
  ↓
REVOKED
  ↓
Generate Again
  ↓
ACTIVE
```

When a QR already exists, the system avoids creating another QR record for the same ticket.

---

## 🖥️ User Interface

The frontend provides:

* Modern corporate landing-page design
* Ticket creation form
* Recent ticket list
* QR generation interface
* QR result display
* Loading indicators
* Empty states
* Validation feedback
* Responsive layout
* Keyboard-accessible controls

The UI follows a clean monochromatic corporate design with controlled accent colors and consistent spacing.

---

## 🏗️ Architecture

The application follows a layered backend structure:

```text
┌──────────────────────────────┐
│        Client UI             │
│   HTML + CSS + JavaScript    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        Express API           │
│ Routes + Validation          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       MongoDB / Mongoose     │
│ Ticket + QRCode Collections  │
└──────────────────────────────┘
```

---

## 📁 Project Structure

```text
Ticket-QR-Generator/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACTS.md
│   ├── DATABASE_SCHEMA.md
│   └── ERD.md
│
├── src/
│   ├── client/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── models/
│   │   ├── Ticket.js
│   │   └── QRCode.js
│   │
│   ├── routes/
│   │   └── ticketRoutes.js
│   │
│   └── server.js
│
├── tests/
│   └── tickets.test.js
│
├── PROMPTS.md
├── README.md
├── package.json
├── package-lock.json
└── .gitignore
```

---

## 🔌 API Endpoints

### Health Check

```http
GET /api/health
```

Returns:

```json
{
  "status": "ok"
}
```

---

### Create Ticket

```http
POST /api/tickets
```

Example:

```json
{
  "title": "Printer Issue",
  "description": "Printer not working on Floor 2",
  "priority": "HIGH",
  "createdBy": "00000000-0000-4000-8000-000000000001"
}
```

---

### Get All Tickets

```http
GET /api/tickets
```

---

### Get Ticket

```http
GET /api/tickets/:id
```

---

### Update Ticket Status

```http
PUT /api/tickets/:id
```

Example:

```json
{
  "status": "RESOLVED"
}
```

---

### Generate QR

```http
POST /api/tickets/:id/qr
```

Behavior:

```text
Active QR
    ↓
Return existing QR

Revoked QR
    ↓
Reactivate existing QR

No QR
    ↓
Create QR
```

---

### Get QR

```http
GET /api/tickets/:id/qr
```

---

### Revoke QR

```http
POST /api/tickets/:id/qr/revoke
```

---

## 🗄️ Database

MongoDB is used as the persistence layer.

### Ticket

Stores:

* ticket number
* title
* description
* priority
* status
* creator
* timestamps

### QRCode

Stores:

* ticket reference
* QR identifier
* QR payload
* QR status
* generation timestamp
* update timestamp

---

## 🔐 Security

The application includes:

* Server-side input validation
* Client-side validation
* Text sanitization
* XSS protection
* Environment variables for database configuration
* No hardcoded database credentials
* Safe API error responses
* No sensitive information in telemetry

User-controlled text is sanitized before being stored or rendered.

---

## ♿ Accessibility

The UI is designed with accessibility in mind:

* Semantic HTML
* Associated labels
* Keyboard navigation
* Focus states
* ARIA labels
* `aria-live` status messages
* Accessible validation errors
* Non-color-only error communication
* Reduced-motion support

---

## 📡 Telemetry

Primary actions simulate an analytics event through the browser/server console:

```text
[Analytics] User interacted with Ticket QR Code Generator Worker
```

Telemetry is simulation-only and does not intentionally contain sensitive information.

---

## 🧪 Testing

The project uses:

* Jest
* Supertest
* MongoDB
* Mongoose

Run the test suite:

```bash
npm test
```

Current automated test result:

```text
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
Snapshots:   0 total
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/saakshigupta-saa/Ticket-QR-Generator.git
```

```bash
cd Ticket-QR-Generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env
```

Add your MongoDB connection string:

```env
MONGO_URI=your_mongodb_connection_string
```

Do not commit `.env` to GitHub.

---

## ▶️ Run the Application

Development mode:

```bash
npm run dev
```

The application runs on:

```text
http://localhost:5000
```

---

## 📜 Available Scripts

| Command       | Purpose                               |
| ------------- | ------------------------------------- |
| `npm run dev` | Start development server with Nodemon |
| `npm start`   | Start production server               |
| `npm test`    | Run automated tests                   |

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Testing

* Jest
* Supertest

### Development

* Nodemon
* Git
* GitHub

---

## 📚 Documentation

Detailed project documentation is available in the `docs/` directory.

| Document             | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `ARCHITECTURE.md`    | System architecture and edge-case strategy |
| `API_CONTRACTS.md`   | API request/response contracts             |
| `DATABASE_SCHEMA.md` | Database design                            |
| `ERD.md`             | Entity Relationship Diagram                |
| `PROMPTS.md`         | AI-assisted engineering prompt history     |

---

## 🔄 Development Workflow

The project follows a test-driven and AI-assisted development workflow:

```text
Requirements
     ↓
Architecture
     ↓
Database Design
     ↓
API Contracts
     ↓
Test Suite
     ↓
Failing Tests
     ↓
Implementation
     ↓
Testing
     ↓
Browser Verification
     ↓
Final Review
```

The AI assistant is used to accelerate development while implementation decisions and verification remain the responsibility of the engineer.

---

## 📌 Project Status

**Status: Functional MVP**

Implemented:

* [x] MongoDB connection
* [x] Ticket creation
* [x] Ticket listing
* [x] Ticket retrieval
* [x] Ticket status update
* [x] QR generation
* [x] QR reuse
* [x] QR revocation
* [x] QR reactivation
* [x] Frontend interface
* [x] QR display
* [x] Input validation
* [x] XSS sanitization
* [x] Loading states
* [x] Empty states
* [x] Accessibility-focused UI
* [x] Telemetry simulation
* [x] Automated API tests

---

## 👩‍💻 Author

**Sakshi Gupta**

BS Computer Science & Data Analytics
IIT Patna

GitHub:
https://github.com/saakshigupta-saa

---

## ⭐ Repository

**Ticket QR Code Generator**

https://github.com/saakshigupta-saa/Ticket-QR-Generator
