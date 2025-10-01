import express from "express";
import cors from "cors";
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  express.json({
    limit: "16kb",
  }),
);

app.use(
  express.urlencoded({
    limit: "16kb",
    extended: true,
  }),
);

app.use(express.static("public"));

app.use(cookieParser());

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN?.split(",") ||
      `http://localhost:${process.env.PORT}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth/", authRouter);

app.get("/", (req, res) => {
  res.send("hi");
});

export default app;
