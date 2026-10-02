class Logger {
    constructor() {
        if (!Logger.instance) {
            Logger.instance = this;
        }

        return Logger.instance;
    }

    log(msg, level, metaData = {}) {
        const messageObj = {
            level: level,
            msg: msg,
            ...metaData,
            timestamp: Date.now(),
        };

        console.log(JSON.stringify(messageObj));
    }

    error(msg, metaData = {}) {
        this.log(msg, "error", metaData);
    }

    info(msg, metaData = {} , info) {
        this.log(msg, "info", metaData);
    }
}

export const logger = new Logger();