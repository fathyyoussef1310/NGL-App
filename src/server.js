import { createApp } from "./main.js";
import http from "http";
import mongoose from "mongoose";

const app = createApp();
const server = http.createServer(app);

async function shutDown() {
    server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
    });
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    });