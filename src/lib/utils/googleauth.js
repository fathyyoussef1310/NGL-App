import {OAuth2Client} from "google-auth-library";
import {AppError} from "../gobalErrorHandler/appError.js";
import {env} from "../config/env.js";
const client = new OAuth2Client();
export const verifyGoogleToken = async (token) => {
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience : env.google.clientId
        });
        return ticket.getPayload();
    }catch(e){
        throw new AppError('Invalid Verification Token', e);
    }
}
