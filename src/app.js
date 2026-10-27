import "./lib/db/db.js";
import express from "express";
import cors from "cors";
import { globalErrorHandler } from "./lib/gobalErrorHandler/error.handler.js";
import { router } from "./route.js";
import { correlationId } from "./pkg/correlation/correlationId.js";
import cookieParser from "cookie-parser";

export const createApp = () => {
    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(correlationId);
    app.use(express.json());
    app.use(cookieParser());
    app.get('/health',(req,res,next)=>{
        console.log('server is Hit');
        res.json('OK')
    })
    app.use("/api", router);
    app.use(globalErrorHandler);

    return app;
};