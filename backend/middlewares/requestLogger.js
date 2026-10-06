const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        logger.info("HTTP Request", {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            responseTime: `${duration} ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent")
        });
    });

    next();
};

module.exports = requestLogger;