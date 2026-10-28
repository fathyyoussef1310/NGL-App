import RefreshToken from "../model/refresh-token.model.js";

export const create = (data) => RefreshToken.create(data);

export const findByHash = (tokenHash) => RefreshToken.findOne({ tokenHash });

export const revoke = (id) =>  RefreshToken.updateOne({ _id: id }, { revokedAt: new Date() });

export const revokeFamily = (family) => RefreshToken.updateMany(
        { family, revokedAt: null },
        { revokedAt: new Date() }
    );
export const revokeIfActive = async (id) => {
    const res = await RefreshToken.findOneAndUpdate(
        { _id: id, revokedAt: null },
        { revokedAt: new Date() }
    );
    console.log("revokeIfActive result:", res);   // ← شوف اللوج
    console.log("id:", id);
    return res !== null;
};
export const revokeAllForUser = (user) =>
    RefreshToken.updateMany({ user, revokedAt: null }, { revokedAt: new Date() });