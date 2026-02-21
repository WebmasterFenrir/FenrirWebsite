const args = Bun.argv.slice(2);
const modeArg = args.find((arg) => arg.startsWith("--mode="));
const portArg = args.find((arg) => arg.startsWith("--port="));

const modeFromCli = modeArg?.split("=")[1];
const portFromCli = portArg?.split("=")[1];

const defaultMode = process.env.FEEDBACK_DEFAULT_MODE ?? "silent";
const mode = modeFromCli ?? process.env.FEEDBACK_MODE ?? defaultMode;
const port = Number.parseInt(
  portFromCli ?? process.env.FEEDBACK_API_PORT ?? process.env.PORT ?? "3000",
  10
);

export const feedbackEnabled = mode === "feedback";

const sitePrefix = process.env.FEEDBACK_SITE_PREFIX ?? "/feedbackwebsite";
const siteRedirect = process.env.FEEDBACK_SITE_REDIRECT ?? "enabled";
const staticRoot =
  process.env.FEEDBACK_STATIC_ROOT ?? "../../feedback-website/public/";

if (feedbackEnabled) {
  console.info("Feedback feature enabled – proxying submissions to n8n.");
} else {
  console.info("Feedback feature disabled – API will return 503.");
}

const feedbackRoot = new URL(staticRoot, import.meta.url);

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-cache"
} as const;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders
  });
}

async function serveFeedbackSite(pathname: string): Promise<Response | null> {
  if (!pathname.startsWith(sitePrefix)) {
    return null;
  }

  let relativePath = pathname.slice(sitePrefix.length);
  if (!relativePath || relativePath === "/") {
    relativePath = "/index.html";
  }

  try {
    const fileUrl = new URL(`.${relativePath}`, feedbackRoot);
    const file = Bun.file(fileUrl);

    if (!(await file.exists())) {
      return relativePath === "/index.html"
        ? jsonResponse(404, { error: "Feedback page not found" })
        : null;
    }

    const type = file.type || Bun.mimeType(fileUrl.pathname) || "application/octet-stream";
    return new Response(file, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error("Failed to serve feedback site asset", error);
    return jsonResponse(500, { error: "Failed to load feedback site asset" });
  }
}

async function handleFeedbackSubmission(request: Request): Promise<Response> {
  if (!feedbackEnabled) {
    return jsonResponse(503, { error: "Feedback feature is currently disabled" });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("N8N_WEBHOOK_URL is not configured");
    return jsonResponse(500, { error: "Feedback service not configured" });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.warn("Invalid JSON payload received", error);
    return jsonResponse(400, { error: "Invalid JSON payload" });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    const contentType = response.headers.get("content-type") ?? "application/json";

    return new Response(responseText, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error("Forwarding feedback to n8n failed", error);
    return jsonResponse(502, { error: "Unable to forward feedback" });
  }
}

const server = Bun.serve({
  port,
  fetch: async (request) => {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (
      siteRedirect !== "disabled" &&
      request.method === "GET" &&
      url.pathname === "/"
    ) {
      return Response.redirect(`${url.origin}${sitePrefix}`, 302);
    }

    const feedbackSiteResponse = await serveFeedbackSite(url.pathname);
    if (feedbackSiteResponse) {
      return feedbackSiteResponse;
    }

    const feedbackEndpoint = process.env.FEEDBACK_ENDPOINT ?? "/feedback";

    if (url.pathname === feedbackEndpoint && request.method === "POST") {
      return handleFeedbackSubmission(request);
    }

    return jsonResponse(404, { error: "Not found" });
  }
});

console.info(`Feedback API listening on port ${server.port} (mode: ${mode})`);
