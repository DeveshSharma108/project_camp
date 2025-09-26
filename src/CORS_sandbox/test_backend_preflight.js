import express from "express";
const app = express();

// Log incoming request headers (for debugging)
app.use((req, res, next) => {
  console.log(req.headers.host);   // Target server
  console.log(req.headers.origin); // Origin of request (frontend)
  next();
});

// CORS middleware: manually allow cross-origin requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // allow frontend
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");   // allow methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-custom-header"); // allow headers
  next();
});

// Handle preflight requests (OPTIONS)
// In Express 5, "*" is replaced with "*splat" for wildcard
app.options("*splat", (req, res) => {
  // Respond 200 OK to preflight, CORS headers are already added by middleware
  res.sendStatus(200);
});

// Backend endpoint to handle actual POST request
app.post("/data", (req, res) => {
  res.json({
    message: "Hello from backend on port 5000 🚀. Sent this data after the preflight req"
  });
});

// Start backend server on port 5000
app.listen(5000, () =>
  console.log("Backend running on http://127.0.0.1:5000")
);
