import { env } from "./config/env";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/errors";
import { adminRoutes } from "./routes/admin";
import { publicRoutes } from "./routes/public";

const app = express();

app.set("trust proxy", env.TRUST_PROXY);
app.disable("x-powered-by");
app.use(helmet());
// Only the website may call the API from a browser.
app.use(cors({ origin: env.FRONTEND_URL, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"], maxAge: 600 }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Lets in-flight requests finish when the host restarts or redeploys the server.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
