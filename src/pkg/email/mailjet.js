import app from "bcrypt/promises.js";
import Mailjet from "node-mailjet";
import {env} from "../../lib/config/env.js";
import {request} from "node:http";

export class MailJetProvider {
    client;
    fromName;
    fromEmail;
     constructor() {
         this.client = new Mailjet(
             {
                 apiKey: env.mailJet.apiKey,
                 apiSecret: env.mailJet.apiSecret,
             },
            this.fromName = env.mailJet.fromName,
            this.fromEmail = env.mailJet.fromEmail,
         );
     }
      async sendEmail(email, subject, html) {
        const res = await this.client.post('send', {version: 'v3.1'}).request({
            Messages: [
                {
                    From: {
                        Email: this.fromEmail,
                        Name: this.fromName,
                    },
                    To: [
                        {
                            Email: email,
                        },
                    ],
                    Subject: subject,
                    HTMLPart: html,
                },
            ],
        })
          const msg = res.body.Messages[0];
          console.log('Mailjet:', msg.Status, 'to', msg.To?.[0]?.Email, 'id', msg.To?.[0]?.MessageID);
          return msg;
    }
}