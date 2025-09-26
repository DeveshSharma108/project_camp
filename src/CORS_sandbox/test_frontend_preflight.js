import express from "express";
const app = express();

// Serve the frontend HTML page
app.get("/", (req, res) => {
  res.send(`
    <h1>Frontend on port 3000</h1>
    <button onclick="callApi()">Call API</button>
    <pre id="output"></pre>
    <script>
      // This function is triggered when the user clicks the button
      function callApi() {
        fetch("http://127.0.0.1:5000/data", {
          method: "POST", // Non-simple method triggers preflight
          headers: {
            "Content-Type": "application/json", // JSON content type
            "X-Custom-Header": "hello",          // Custom header triggers preflight
          },
          body: JSON.stringify({ name: "Alice" }), // Sending JSON data
        })
        .then(res => res.json()) // Parse JSON response
        .then(data => {
          // Display the backend response in the <pre> block
          document.getElementById("output").textContent = JSON.stringify(data, null, 2);
        })
        .catch(err => {
          // Display errors if fetch fails
          document.getElementById("output").textContent = "Error: " + err;
        });
      }
    </script>
  `);
});

// Start frontend server on port 3000
app.listen(3000, () =>
  console.log("Frontend running on http://localhost:3000"),
);
