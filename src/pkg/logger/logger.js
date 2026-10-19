const serialize = (value) => {
    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            statusCode: value.statusCode ?? value.response?.status,
            details: value.response?.data ?? value.ErrorMessage,
            stack: value.stack,
        };
    }
    if (value !== null && typeof value === 'object') return value;
    return { data: value }; // strings, numbers, undefined
};

// Never throws on circular references
const safeStringify = (obj) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, val) => {
        if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) return '[Circular]';
            seen.add(val);
        }
        return val;
    });
};

class Logger {
    constructor() {
        if (!Logger.instance) {
            Logger.instance = this;
        }
        return Logger.instance;
    }

    log(msg, level, metaData) {
        const messageObj = {level, msg,
            ...serialize(metaData),
            timestamp: Date.now(),
        };

        console.log(safeStringify(messageObj));
    }

    error(msg, metaData) {
        this.log(msg, 'error', metaData);
    }

    info(msg, metaData) {
        this.log(msg, 'info', metaData);
    }
}

export const logger = new Logger();