const { app } = require("@azure/functions");

/** Minimal contact stub — logs payload shape; wire Resend later via env (never commit secrets). */
app.http("contact", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "contact",
  handler: async (request, context) => {
    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { ok: false, error: "Invalid JSON" } };
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || message.length < 10) {
      return { status: 400, jsonBody: { ok: false, error: "Missing fields" } };
    }

    context.log(`contact stub from ${email} (${name}), len=${message.length}`);

    return {
      status: 200,
      jsonBody: { ok: true, message: "Received (stub)" },
    };
  },
});