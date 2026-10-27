import http from "http";
import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const { createApp } = await import("./app.js");

const app = createApp();
const server = http.createServer(app);

async function shutDown() {
    server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
    });
}

process.on("SIGINT", shutDown); // CTRL+C
process.on("SIGTERM", shutDown); // Unexpected event

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});