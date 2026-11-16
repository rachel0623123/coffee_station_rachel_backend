import express from "express";

// Builds the app without calling listen(), so tests can import it directly.
export const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
