import {RedisCacheProvider} from "../../pkg/cache/redis.js";
import {env} from "../config/env.js";

export const cacheProvider = new RedisCacheProvider({
    host: env.redis.host,
    port: env.redis.port,
    user: env.redis.user,
    password: env.redis.password,
});