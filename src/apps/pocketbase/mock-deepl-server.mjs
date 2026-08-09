// Mock DeepL API server for local end-to-end testing of the translate hook.
// Returns a "translated" (uppercased) response so we can verify the full flow.
import http from "node:http";

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    console.log("[mock-deepl] " + req.method + " " + req.url + " auth=" + (req.headers.authorization || "none"));
    let parsed = {};
    try {
      parsed = JSON.parse(body || "{}");
    } catch (err) {
      // ignore
    }
    const texts = Array.isArray(parsed.text) ? parsed.text : [];
    const translations = texts.map((t) => ({ text: "[EN] " + t }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ translations }));
  });
});

server.listen(8899, "127.0.0.1", () => {
  console.log("[mock-deepl] listening on http://127.0.0.1:8899/v2/translate");
});
