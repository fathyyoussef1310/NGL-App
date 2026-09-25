import { config } from "dotenv";
config();
import mongoose from "mongoose";
await mongoose.connect(process.env.MONGODB_URI);
