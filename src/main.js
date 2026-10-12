import "./lib/db/db.js";
import express from "express";
import cors from "cors";
import { globalErrorHandler } from "./lib/gobalErrorHandler/error.handler.js";
import { router } from "./route.js";

export const createApp = () => {
    const app = express();

    app.use(cors({ origin: "*" }));
    app.use(express.json());
    app.use("/api", router);
    app.use(globalErrorHandler);

    return app;
};