import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    family: { type: String, required: true, index: true }, // one family per login chain
    expiresAt: { type: Date, required: true },
});
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = model("RefreshToken", refreshTokenSchema);
export default RefreshToken;