# AI-Assisted Engineering Prompt Log

## Project

**Ticket QR Code Generator Worker**

**Ticket ID:** ENG-139055

**Epic:** Core Infrastructure Overhaul

**Priority:** P1

**Assigned To:** Sakshi Gupta

---

# 1. Project Understanding

### Prompt

> I am working on Ticket ENG-139055, "Ticket QR Code Generator Worker". Review the provided Technical Requirements Document and help me understand the requirements before writing any implementation code.
>
> The current phase is architectural planning only. Do not generate feature code yet.
>
> Identify the required entities, relationships, API resources, validation requirements, edge cases, accessibility requirements, security requirements, telemetry requirements, and non-functional requirements.

### Purpose

Used to understand the assignment and separate architectural planning from feature implementation.

---

# 2. Database Entity Identification

### Prompt

> Based on the Ticket QR Code Generator Worker requirements, identify the minimum set of database entities required for the system.
>
> For each entity, explain its responsibility and the relationships between entities.
>
> Focus only on database architecture. Do not write application code.

### Purpose

Used to establish the initial domain model.

---

# 3. Database Schema Design

### Prompt

> Design a definitive database schema for the Ticket QR Code Generator Worker.
>
> Include:
>
> * Entity names
> * Field names
> * Data types
> * Primary keys
> * Foreign keys
> * Unique constraints
> * Enum values
> * Indexes
> * Timestamps
> * Data integrity rules
>
> The schema should support ticket creation, QR generation, QR status management, and QR generation audit history.
>
> Keep the design normalized and suitable for an enterprise application.

### Purpose

Used to create `DATABASE_SCHEMA.md`.

---

# 4. ERD Design

### Prompt

> Create an Entity Relationship Diagram for the proposed Ticket QR Code Generator Worker database.
>
> The diagram should clearly show:
>
> * User
> * Ticket
> * QRCode
> * QRGenerationLog
> * Primary keys
> * Foreign keys
> * One-to-many relationships
> * One-to-zero-or-one Ticket-to-QRCode relationship
>
> Provide the ERD in Mermaid format so it can be stored in Markdown and rendered by GitHub.

### Purpose

Used to create `ERD.md`.

---

# 5. API Contract Design

### Prompt

> Design REST API contracts for the Ticket QR Code Generator Worker without implementing the APIs.
>
> Include contracts for:
>
> * Creating tickets
> * Listing tickets
> * Retrieving a ticket
> * Generating a QR code
> * Retrieving a QR code
> * Revoking a QR code
> * Retrieving QR generation history
>
> For each endpoint specify:
>
> * HTTP method
> * URL
> * Purpose
> * Request parameters/body
> * Validation rules
> * Success response
> * Error responses
> * HTTP status codes
>
> Use consistent JSON response structures.

### Purpose

Used to create `API_CONTRACTS.md`.

---

# 6. Edge-Case Architecture

### Prompt

> Design the edge-case and failure-state architecture for the Ticket QR Code Generator Worker.
>
> The implementation must handle:
>
> * Empty states
> * Slow 3G connectivity
> * Network failures
> * Loading states
> * Invalid inputs
> * Duplicate QR generation requests
> * QR generation failures
> * XSS attempts
> * Unexpected frontend errors
>
> Explain the expected behavior of the UI, API, database, and audit logging in each situation.
>
> Do not write feature implementation code.

### Purpose

Used to document the "Unhappy Path" requirements.

---

# 7. Accessibility Architecture

### Prompt

> Define an accessibility architecture for the Ticket QR Code Generator Worker targeting a 100% Lighthouse accessibility score.
>
> Cover:
>
> * Keyboard navigation
> * Accessible button and input labels
> * ARIA attributes
> * Validation error associations
> * Loading states
> * Focus states
> * Color contrast
> * Screen-reader-friendly status messages
>
> Provide implementation-oriented guidance without writing the final application code.

### Purpose

Used to document the accessibility requirements.

---

# 8. Security Architecture

### Prompt

> Define the security requirements for the Ticket QR Code Generator Worker.
>
> The requirements include sanitizing user-controlled text against XSS before storing it in application state, server-side validation, protection of credentials, safe logging, and avoiding sensitive information in telemetry.
>
> Explain where validation and sanitization should occur and how the architecture should prevent unsafe data from reaching the database or UI.

### Purpose

Used to document the security architecture.

---

# 9. Telemetry Design

### Prompt

> Design a simulated telemetry approach for the Ticket QR Code Generator Worker.
>
> The primary action should log:
>
> [Analytics] User interacted with Ticket QR Code Generator Worker
>
> Explain when this event should fire, what information should not be logged, and how telemetry should remain separate from the main business operation.

### Purpose

Used to define the telemetry behavior required by the TRD.

---

# 10. Corporate UI Design System

### Prompt

> Define a clean monochromatic corporate design system for the Ticket QR Code Generator Worker.
>
> Follow these constraints:
>
> * No rogue hex colors
> * Consistent spacing using 16px and 32px steps
> * Consistent typography
> * Consistent buttons and inputs
> * Accessible contrast
> * Clear visual hierarchy
> * Professional enterprise appearance
>
> Do not introduce unnecessary visual styles.

### Purpose

Used to establish the design handoff requirements.

---

# 11. Architecture Review

### Prompt

> Review the complete proposed architecture for the Ticket QR Code Generator Worker.
>
> Check whether the database schema, ERD, API contracts, edge-case handling, accessibility, security, telemetry, and design-system requirements are consistent with each other.
>
> Identify missing requirements, contradictions, unnecessary complexity, or potential reliability problems.
>
> Do not write implementation code. Provide architectural corrections only.

### Purpose

Used as a final architecture review before implementation.

---

# 12. Engineering Approach

The project follows an AI-assisted engineering workflow.

The intended implementation process is:

```text
Requirements
     ↓
Architecture
     ↓
Test Design
     ↓
Failing Tests
     ↓
Implementation
     ↓
Test Execution
     ↓
Browser Verification
     ↓
Linting
     ↓
Final Review
```

The AI is used as an engineering assistant rather than as a replacement for verification.

All generated work should be reviewed against the Technical Requirements Document before acceptance.

---

# 13. TDD Requirement

Before feature implementation, the acceptance criteria and NFRs should be converted into automated tests using Jest or Vitest.

The expected workflow is:

```text
Acceptance Criteria
       ↓
Write Tests
       ↓
Run Tests
       ↓
Tests Fail
       ↓
Implement Feature
       ↓
Run Tests Again
       ↓
Fix Failures
       ↓
Manual Browser Verification
```

Feature implementation should not be considered complete merely because the application renders successfully.

---

# 14. Verification Checklist

Before final delivery, verify:

* [ ] Application starts without fatal errors
* [ ] Tests pass
* [ ] Linting passes
* [ ] No unused imports
* [ ] Empty states work
* [ ] Loading indicators work
* [ ] Network failures are handled
* [ ] Invalid inputs are rejected
* [ ] Invalid fields are visually identified
* [ ] XSS input is sanitized
* [ ] QR generation does not create duplicate active records
* [ ] Telemetry message is logged
* [ ] Keyboard navigation works
* [ ] Accessibility requirements are satisfied
* [ ] No API keys are committed
* [ ] No sensitive credentials are committed
* [ ] `PROMPTS.md` is included in the repository

----

# 15. Documentation
Document	Purpose
DATABASE_SCHEMA.md	Definitive database schema
ERD.md	Entity Relationship Diagram
API_CONTRACTS.md	API request/response contracts
ARCHITECTURE.md	Architecture and edge-case strategy
PROMPTS.md	AI-assisted engineering prompt history
README.md	Project overview
---- 
# 16. Project Status

The project is currently in the architecture planning phase.

No feature implementation should begin until the architecture, database schema, API contracts, and test strategy have been reviewed.