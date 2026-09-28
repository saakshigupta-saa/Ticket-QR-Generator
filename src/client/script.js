const API_BASE_URL = "/api/tickets";

const ticketForm = document.getElementById("ticketForm");

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");

const titleError = document.getElementById("titleError");
const descriptionError = document.getElementById("descriptionError");
const priorityError = document.getElementById("priorityError");

const createTicketBtn =
  document.getElementById("createTicketBtn");

const createButtonText =
  document.getElementById("createButtonText");

const createLoader =
  document.getElementById("createLoader");

const refreshBtn =
  document.getElementById("refreshBtn");

const ticketsLoader =
  document.getElementById("ticketsLoader");

const emptyState =
  document.getElementById("emptyState");

const ticketsList =
  document.getElementById("ticketsList");

const qrResult =
  document.getElementById("qrResult");

const qrCodeImage =
  document.getElementById("qrCodeImage");

const qrIdentifier =
  document.getElementById("qrIdentifier");

const closeQrBtn =
  document.getElementById("closeQrBtn");


/* =================================
   SANITIZATION
================================= */

const sanitizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    )
    .replace(/<[^>]*>/g, "")
    .trim();
};


/* =================================
   FORM ERRORS
================================= */

const setFieldError = (
  input,
  errorElement,
  message
) => {
  errorElement.textContent = message;

  if (message) {
    input.setAttribute(
      "aria-invalid",
      "true"
    );
  } else {
    input.removeAttribute(
      "aria-invalid"
    );
  }
};


const clearFormErrors = () => {
  setFieldError(
    titleInput,
    titleError,
    ""
  );

  setFieldError(
    descriptionInput,
    descriptionError,
    ""
  );

  setFieldError(
    priorityInput,
    priorityError,
    ""
  );
};


/* =================================
   FORM VALIDATION
================================= */

const validateForm = () => {
  clearFormErrors();

  const title =
    sanitizeText(titleInput.value);

  const description =
    sanitizeText(descriptionInput.value);

  const priority =
    priorityInput.value;

  let isValid = true;


  if (!title) {
    setFieldError(
      titleInput,
      titleError,
      "Ticket title is required."
    );

    isValid = false;
  }


  if (title.length > 100) {
    setFieldError(
      titleInput,
      titleError,
      "Title must be 100 characters or less."
    );

    isValid = false;
  }


  if (description.length > 1000) {
    setFieldError(
      descriptionInput,
      descriptionError,
      "Description must be 1000 characters or less."
    );

    isValid = false;
  }


  if (!priority) {
    setFieldError(
      priorityInput,
      priorityError,
      "Please select a priority."
    );

    isValid = false;
  }


  return {
    isValid,
    title,
    description,
    priority,
  };
};


/* =================================
   CREATE LOADING
================================= */

const setCreateLoading = (
  loading
) => {
  createTicketBtn.disabled =
    loading;

  createLoader.classList.toggle(
    "hidden",
    !loading
  );

  createButtonText.textContent =
    loading
      ? "Creating..."
      : "Create Ticket";
};


/* =================================
   TICKETS LOADING
================================= */

const setTicketsLoading = (
  loading
) => {
  ticketsLoader.classList.toggle(
    "hidden",
    !loading
  );

  refreshBtn.disabled =
    loading;
};


/* =================================
   QR RESULT
================================= */

const hideQrResult = () => {
  qrResult.classList.add(
    "hidden"
  );

  qrCodeImage.replaceChildren();

  qrIdentifier.textContent = "-";
};


const showQrResult = (
  qrData
) => {
  qrResult.classList.remove(
    "hidden"
  );

  qrIdentifier.textContent =
    qrData.qrIdentifier || "-";


  /*
   * The backend returns a JSON payload.
   * We use that payload as the QR content.
   */

  const qrPayload =
    qrData.payload ||
    JSON.stringify({
      ticketId: qrData.ticketId,
      qrIdentifier:
        qrData.qrIdentifier,
    });


  /*
   * Use browser-native SVG generation
   * through an external QR service.
   *
   * The QR image is generated from the
   * backend payload.
   */

  const qrImage =
    document.createElement("img");

  qrImage.className =
    "generated-qr";

  qrImage.alt =
    "Generated ticket QR code";

  qrImage.width = 220;
  qrImage.height = 220;

  qrImage.src =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      qrPayload
    )}`;


  qrCodeImage.replaceChildren(
    qrImage
  );

  qrResult.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};


/* =================================
   CREATE TICKET CARD
================================= */

const createTicketCard = (
  ticket
) => {
  const card =
    document.createElement("article");

  card.className =
    "ticket-card";


  const header =
    document.createElement("div");

  header.className =
    "ticket-card-header";


  const information =
    document.createElement("div");


  const ticketNumber =
    document.createElement("p");

  ticketNumber.className =
    "ticket-number";

  ticketNumber.textContent =
    ticket.ticketNumber;


  const title =
    document.createElement("h3");

  title.className =
    "ticket-title";

  title.textContent =
    ticket.title;


  information.append(
    ticketNumber,
    title
  );


  const status =
    document.createElement("span");

  status.className =
    "meta-badge";

  status.textContent =
    ticket.status;


  header.append(
    information,
    status
  );


  const description =
    document.createElement("p");

  description.className =
    "ticket-description";

  description.textContent =
    ticket.description ||
    "No description provided.";


  const meta =
    document.createElement("div");

  meta.className =
    "ticket-meta";


  const priority =
    document.createElement("span");

  priority.className =
    "meta-badge";

  priority.textContent =
    `Priority: ${ticket.priority}`;


  meta.appendChild(
    priority
  );


  const actions =
    document.createElement("div");

  actions.className =
    "ticket-actions";


  const generateButton =
    document.createElement("button");

  generateButton.type =
    "button";

  generateButton.className =
    "secondary-button";

  generateButton.textContent =
    "Generate QR";

  generateButton.setAttribute(
    "aria-label",
    `Generate QR code for ${ticket.ticketNumber}`
  );


  generateButton.addEventListener(
    "click",
    () => {
      generateQRCode(
        ticket._id || ticket.id,
        generateButton
      );
    }
  );


  actions.appendChild(
    generateButton
  );


  card.append(
    header,
    description,
    meta,
    actions
  );


  return card;
};


/* =================================
   RENDER TICKETS
================================= */

const renderTickets = (
  tickets
) => {
  ticketsList.replaceChildren();

  if (
    !Array.isArray(tickets) ||
    tickets.length === 0
  ) {
    emptyState.classList.remove(
      "hidden"
    );

    return;
  }


  emptyState.classList.add(
    "hidden"
  );


  const fragment =
    document.createDocumentFragment();


  tickets.forEach(
    (ticket) => {
      fragment.appendChild(
        createTicketCard(ticket)
      );
    }
  );


  ticketsList.appendChild(
    fragment
  );
};


/* =================================
   LOAD TICKETS
================================= */

const loadTickets = async () => {
  setTicketsLoading(true);

  try {
    const response =
      await fetch(
        API_BASE_URL
      );


    if (!response.ok) {
      throw new Error(
        "Failed to load tickets."
      );
    }


    const tickets =
      await response.json();


    renderTickets(
      tickets
    );

  } catch (error) {

    console.error(
      "Load tickets error:",
      error
    );


    ticketsList.replaceChildren();

    emptyState.classList.remove(
      "hidden"
    );

  } finally {

    setTicketsLoading(
      false
    );
  }
};


/* =================================
   GENERATE QR
================================= */

const generateQRCode = async (
  ticketId,
  button
) => {

  if (!ticketId) {
    return;
  }


  const originalText =
    button.textContent;


  button.disabled = true;

  button.textContent =
    "Generating...";


  try {

    const response =
      await fetch(
        `${API_BASE_URL}/${ticketId}/qr`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data.error ||
        "Failed to generate QR code."
      );
    }


    /*
     * Display the actual QR result.
     */

    showQrResult(
      data
    );


    /*
     * Telemetry
     */

    console.log(
      "[Analytics] User interacted with Ticket QR Code Generator Worker"
    );


    button.textContent =
      "QR Generated";


    setTimeout(() => {
      button.textContent =
        originalText;
    }, 1500);

  } catch (error) {

    console.error(
      "QR generation error:",
      error
    );


    button.textContent =
      "Try Again";


    setTimeout(() => {
      button.textContent =
        originalText;
    }, 1500);

  } finally {

    button.disabled =
      false;
  }
};


/* =================================
   CREATE TICKET
================================= */

ticketForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const {
      isValid,
      title,
      description,
      priority,
    } = validateForm();


    if (!isValid) {
      return;
    }


    setCreateLoading(
      true
    );


    try {

      const response =
        await fetch(
          API_BASE_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title,
              description,
              priority,

              createdBy:
                "00000000-0000-4000-8000-000000000001",
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to create ticket."
        );
      }


      console.log(
        "[Analytics] User interacted with Ticket QR Code Generator Worker"
      );


      ticketForm.reset();

      clearFormErrors();

      hideQrResult();

      await loadTickets();

    } catch (error) {

      console.error(
        "Create ticket error:",
        error
      );

    } finally {

      setCreateLoading(
        false
      );
    }
  }
);


/* =================================
   REFRESH
================================= */

refreshBtn.addEventListener(
  "click",
  loadTickets
);


/* =================================
   CLOSE QR
================================= */

closeQrBtn.addEventListener(
  "click",
  hideQrResult
);


/* =================================
   INITIAL LOAD
================================= */

hideQrResult();

loadTickets();

