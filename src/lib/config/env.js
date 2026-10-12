
import 'dotenv/config';
import { z } from "zod";

const schema = z.object({
    PORT: z.string().default('3000'),
    MONGODB_URI: z.string(),
    JWT_SECRETKEY: z.string(),
    EMAIL_USER: z.string().trim().toLowerCase(),
    PASSWORD_USER: z.string(),
    GOOGLE_OAUTH_CLIENTID: z.string(),
    REDIS_PORT: z.string().default('6379'),
    REDIS_HOST: z.string().default('127.0.0.1'),
    REDIS_PASSWORD: z.string().default(''),
});

// To Parse Data
const parsed = schema.parse(process.env);

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
        secret: parsed.JWT_SECRETKEY,
    },
    google: {
        clientId: parsed.GOOGLE_OAUTH_CLIENTID,
    }
};