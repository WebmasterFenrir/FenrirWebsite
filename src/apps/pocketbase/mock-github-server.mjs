// Mock GitHub Issues API server for local end-to-end testing of the
// "bugticket" form hook (forms.pb.js). Captures every created issue and
// replies 201, so the full submission → GitHub issue flow can be verified
// without a real token. Point the hook at it with:
//
//   GITHUB_API_URL=http://127.0.0.1:8898 GITHUB_TOKEN=test-token \
//     ./pocketbase.exe serve ...
//
// Usage: bun mock-github-server.mjs   (or run via smoke-bugticket-test.mjs)
import http from "node:http";

const created = [];

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    let parsed = {};
    try {
      parsed = JSON.parse(body || "{}");
    } catch (err) {
      // ignore
    }
    created.push({
      url: req.url,
      authorization: req.headers.authorization || null,
      ...parsed,
    });
    console.log(
      "[mock-github] " +
        req.method +
        " " +
        req.url +
        " auth=" +
        (req.headers.authorization || "none") +
        " title=" +
        (parsed.title || "").slice(0, 60)
    );

    // A title of exactly "boom" simulates a GitHub failure so the smoke test
    // can verify the hook never rejects a submission because GitHub failed.
    if (parsed.title === "boom") {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "simulated failure" }));
      return;
    }

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        html_url:
          "https://github.com/WebmasterFenrir/FenrirWebsite/issues/" +
          created.length,
        number: created.length,
      })
    );
  });
});

server.listen(8898, "127.0.0.1", () => {
  console.log("[mock-github] listening on http://127.0.0.1:8898");
});

process.on("SIGINT", () => {
  console.log("[mock-github] captured issues:\n" + JSON.stringify(created, null, 2));
  process.exit(0);
});
