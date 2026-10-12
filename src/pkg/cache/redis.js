import Redis from "ioredis";
import {logger} from "../logger/logger.js";


//// First Part Of Cashing

export class RedisCacheProvider {
    client;
    constructor(config) {
        this.client = new Redis({
            host: config.host,
            port: config.port,
            password: config.password,
            lazyConnect: true,
            maxRetries: 3,
        });
        this.client.connect().catch((err) => {
            console.error(err);
        });
        this.client.on('error', (err) => {
            console.error(err);
        })
    }
    async set(key , value , ttl) {
        return this.client.set(key , value , 'EX',ttl);
    }
    async get(key) {
        return this.client.get(key)
    }
    async del(key) {
        return this.client.del(key)
    }
}

//
// new RedisCacheProvider({
//     host: "127.0.0.1",
//     port: "6739",
//     password: "",
// });