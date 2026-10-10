import {OAuth2Client} from "google-auth-library";
import {AppError} from "./appError.js";
const client = new OAuth2Client();
export const verifyGoogleToken = async (token) => {
    try{
        const ticket = await client.verifyIdToken({idToken: token , audience : process.env.GOOGLE_OAUTH_CLIENTID},);
        return ticket.getPayload();
    }catch(e){
        throw new AppError('Invalid Verification Token', e);
    }
}
