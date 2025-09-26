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
        // Simple GET request to the backend
        fetch("http://127.0.0.1:5000/data")
          .then(res => res.json()) // parse JSON response
          .then(data => {
            // Display the backend response in the <pre> block
            document.getElementById("output").textContent = JSON.stringify(data, null, 2);
          })
          .catch(err => {
            // Display errors if the fetch fails
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
