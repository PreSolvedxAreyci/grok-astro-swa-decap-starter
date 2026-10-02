const { app } = require("@azure/functions");
const crypto = require("crypto");

/**
 * Decap CMS OAuth proxy — start GitHub authorization.
 * Decap opens: {base_url}/{auth_endpoint}?provider=github
 * Configure: base_url = site origin, auth_endpoint = api/auth
 */
app.http("auth", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "auth",
  handler: async (request, context) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      context.error("GITHUB_CLIENT_ID is not configured");
      return {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "OAuth is not configured (missing GITHUB_CLIENT_ID).",
      };
    }

    const url = new URL(request.url);
    const provider = url.searchParams.get("provider") || "github";
    if (provider !== "github") {
      return {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "Unsupported provider. Use provider=github.",
      };
    }

    const redirectUri =
      process.env.OAUTH_REDIRECT_URI ||
      `${process.env.SITE_URL || "https://grokdemo.juankibin.space"}/api/callback`;

    // public repo → public_repo is enough; repo works for private too. Prefer repo for write editors.
    const scope = process.env.GITHUB_OAUTH_SCOPE || "repo,user";
    const state = crypto.randomBytes(16).toString("hex");

    const authorize = new URL("https://github.com/login/oauth/authorize");
    authorize.searchParams.set("client_id", clientId);
    authorize.searchParams.set("redirect_uri", redirectUri);
    authorize.searchParams.set("scope", scope);
    authorize.searchParams.set("state", state);

    context.log(`Redirecting to GitHub OAuth (scope=${scope})`);

    return {
      status: 302,
      headers: {
        Location: authorize.toString(),
        // Soft hint; state is also in the authorize URL. Cookie helps CSRF if we validate later.
        "Set-Cookie": `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        "Cache-Control": "no-store",
      },
    };
  },
});
