import {cacheProvider} from "../cache/init.js";

export function idempotency(ttl=36000) {
    return async function (req, res, next) {
        const idempotency = req.header['idempotency-key'];
        let key = `${req.method}: ${req.originalUrl}:${idempotency}`
        const cached = await cacheProvider.get(key)
        if (cached) {
            res.setHeader('X-Cache-Control', 'HIT')
            return res.json(JSON.parse(cached));
        }
        const originalJson = res.json.bind(res);
        res.json(async (body) => {
            await cacheProvider.set(key, JSON.stringify(body), ttl);
            res.setHeader('X-Cache-Control', 'MISS');
            return res.json(originalJson);
        });
        next()
    }
}