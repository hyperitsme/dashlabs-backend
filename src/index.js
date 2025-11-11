require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const { limiter } = require("./middleware/limiter");
const { notFound, onError } = require("./middleware/errors");
const api = require("./routes/api");

const app = express();
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT || 10000);
const ORIGINS =
  (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

// Security & basics
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// CORS (allow list)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl
    if (ORIGINS.length === 0) return cb(null, true); // allow all (dev)
    const allowed = ORIGINS.some(o => origin.startsWith(o));
    cb(allowed ? null : new Error("CORS not allowed"), allowed);
  }
}));

app.use(morgan("dev"));
app.use(limiter);

// Routes
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "dashlabs-backend", docs: "/api/health" });
});
app.use("/api", api);

// Errors
app.use(notFound);
app.use(onError);

// Start
app.listen(PORT, () => {
  console.log(`DashLabs backend listening on :${PORT}`);
});
