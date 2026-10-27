
import 'dotenv/config';
import { z } from "zod";

const schema = z.object({
    PORT: z.string().default('3000'),
    MONGODB_URI: z.string(),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES: z.string().default('7d'),
    EMAIL_USER: z.string().trim().toLowerCase(),
    PASSWORD_USER: z.string(),
    GOOGLE_OAUTH_CLIENTID: z.string(),
    REDIS_PORT: z.string().default('6379'),
    REDIS_HOST: z.string().default('127.0.0.1'),
    REDIS_PASSWORD: z.string().optional(),
    MAILJET_API_KEY: z.string().min(1),
    MAILJET_API_SECRET: z.string().min(1),
    MAILJET_FROM_EMAIL: z.string().email(),
    MAILJET_FROM_NAME: z.string().min(1),
});

// To Parse Data
const result = schema.safeParse(process.env);

if (!result.success) {
    console.error("Invalid environment variables:", JSON.stringify(result.error.issues, null, 2));
    process.exit(1);
}

const parsed = result.data;
// AutoComplete
export const env = {
    db: {
        url: parsed.MONGODB_URI,
    },
    redis: {
        host: parsed.REDIS_HOST,
        port: Number(parsed.REDIS_PORT),
        password: parsed.REDIS_PASSWORD,
    },
    port: Number(parsed.PORT),
    nodeMailer: {
        user: parsed.EMAIL_USER,
        password: parsed.PASSWORD_USER,
    },
    jwt: {
        accessSecret: parsed.JWT_ACCESS_SECRET,
        refreshSecret: parsed.JWT_REFRESH_SECRET,
        accessExpires: parsed.JWT_ACCESS_EXPIRES,
        refreshExpires: parsed.JWT_REFRESH_EXPIRES,
    },
    google: {
        clientId: parsed.GOOGLE_OAUTH_CLIENTID,
    },
    mailJet: {
        apiKey: parsed.MAILJET_API_KEY,
        apiSecret: parsed.MAILJET_API_SECRET,
        fromName: parsed.MAILJET_FROM_NAME,
        fromEmail: parsed.MAILJET_FROM_EMAIL,
    }
};