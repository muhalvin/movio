import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";

import { env } from "./config/env";
import apiRoutes from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { rateLimit } from "./middlewares/rateLimit";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit);

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

const swaggerDocument = yaml.load(path.resolve(process.cwd(), "docs", "openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
