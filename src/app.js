import "./lib/db/db.js";
import express from "express";
import cors from "cors";
import { globalErrorHandler } from "./lib/gobalErrorHandler/error.handler.js";
import { router } from "./route.js";
import { correlationId } from "./lib/correlation/correlationId.js";
import cookieParser from "cookie-parser";

export const createApp = () => {
    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(correlationId);
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api", router);
    app.use(globalErrorHandler);

    return app;
};