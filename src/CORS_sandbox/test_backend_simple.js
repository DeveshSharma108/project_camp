import express from "express";

const app = express();

// Middleware to log incoming headers (for debugging)
app.use((req, res, next) => {
  console.log(req.headers.host); // Target server
  console.log(req.headers.origin); // Origin of request (frontend)
  // res.custom_fn = function(){
  //   console.log('hi')
  // }
  next();
});

// CORS middleware: manually allow cross-origin requests
app.use((req, res, next) => {
  // Allow requests from http://localhost:3000 only
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  // Allow GET, POST, OPTIONS methods (OPTIONS included for completeness)
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // Allow only simple header Content-Type
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Proceed to the next middleware/route
  next();
});

// Backend endpoint that returns JSON
app.get("/data", (req, res) => {
  // res.custom_fn()
  res.json({ message: "Hello from backend on port 5000 🚀" });
});

// Start backend server on port 5000
app.listen(5000, () => console.log("Backend running on http://127.0.0.1:5000"));
