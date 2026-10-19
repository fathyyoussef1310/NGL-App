import {MailJetProvider} from "../../pkg/email/mailjet.js";
import {env} from "../config/env.js";

export const mailJetProvider = new MailJetProvider({
    apiKey: env.mailJet.apiKey,
    apiSecret: env.mailJet.apiSecret,
    fromEmail: env.mailJet.fromEmail,
    fromName: env.mailJet.fromName,
});