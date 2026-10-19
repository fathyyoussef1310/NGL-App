import { cacheProvider } from "./init.js";

export function withCache(ttl = 3600) {
    return async (req, res, next) => {
        try {
            let key = `${req.method}:${req.originalUrl}`;
            const cached = await cacheProvider.get(key);
            if (cached) {
                res.setHeader("Cache-Control", "HIT");
                return res.status(200).json(JSON.parse(cached));
            }
            const originalJson = res.json.bind(res);
            //// Interceptor
            res.json = (body) => {
                if (res.statusCode >= 200 && res.statusCode < 300 ) {
                    cacheProvider.set(key, JSON.stringify(body), ttl)
                    res.setHeader("Cache-Control", "MISS");
                    return originalJson(body);
                }else {
                    next()
                }
            };
            next();
        } catch (err) {
            next(err);
        }
    };
}