const { app } = require("@azure/functions");

/**
 * Decap CMS OAuth proxy — exchange code for token and postMessage to opener.
 * Protocol matches Netlify/Decap expectation:
 *   authorizing:github
 *   authorization:github:success:{"token":"...","provider":"github"}
 */
function renderPostMessagePage(status, content) {
  const payload = JSON.stringify(content);
  // Escape for embedding inside a JS string literal safely via JSON.stringify of the full message
  const message = JSON.stringify(`authorization:github:${status}:${payload}`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Authorizing Decap CMS…</title>
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; color: #111; }
  </style>
</head>
<body>
  <p>Authorizing Decap CMS… You can close this window.</p>
  <script>
    (function () {
      var msg = ${message};
      function receiveMessage(event) {
        window.opener.postMessage(msg, event.origin || "*");
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      if (window.opener) {
        window.opener.postMessage("authorizing:github", "*");
      }
      // Fallback if opener never pings back (some browsers / timing)
      setTimeout(function () {
        if (window.opener) {
          window.opener.postMessage(msg, "*");
        }
      }, 1000);
    })();
  </script>
</body>
</html>`;
}

app.http("callback", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "callback",
  handler: async (request, context) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      context.error("GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not configured");
      return {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: renderPostMessagePage("error", {
          error: "oauth_not_configured",
          error_description: "Server OAuth credentials are missing.",
        }),
      };
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const oauthError = url.searchParams.get("error");

    if (oauthError) {
      const description =
        url.searchParams.get("error_description") || oauthError;
      return {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: renderPostMessagePage("error", {
          error: oauthError,
          error_description: description,
        }),
      };
    }

    if (!code) {
      return {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: renderPostMessagePage("error", {
          error: "missing_code",
          error_description: "Missing authorization code.",
        }),
      };
    }

    const redirectUri =
      process.env.OAUTH_REDIRECT_URI ||
      `${process.env.SITE_URL || "https://grokdemo.juankibin.space"}/api/callback`;

    let tokenResponse;
    try {
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "grok-astro-swa-decap-oauth",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });
      tokenResponse = await res.json();
    } catch (err) {
      context.error("Token exchange failed", err);
      return {
        status: 502,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: renderPostMessagePage("error", {
          error: "token_exchange_failed",
          error_description: "Could not reach GitHub token endpoint.",
        }),
      };
    }

    if (tokenResponse.error || !tokenResponse.access_token) {
      context.warn("GitHub token error: " + (tokenResponse.error || "no_token"));
      return {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: renderPostMessagePage("error", {
          error: tokenResponse.error || "no_token",
          error_description:
            tokenResponse.error_description || "No access_token returned.",
        }),
      };
    }

    // Never log the access token.
    context.log("GitHub OAuth token exchange succeeded");

    return {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: renderPostMessagePage("success", {
        token: tokenResponse.access_token,
        provider: "github",
      }),
    };
  },
});
