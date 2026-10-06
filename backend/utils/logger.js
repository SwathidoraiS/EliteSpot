const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");

// Create ONE common log directory
const logDir = path.join(__dirname, "../logs");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}


// Common log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {

        let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

        if (Object.keys(meta).length) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }

        if (stack) {
            log += `\n${stack}`;
        }

        return log;
    })
);


// Create logger
const createLogger = () => {

    return winston.createLogger({
        level: "info",

        format: logFormat,

        transports: [

            // ONE common rotating log file
            new DailyRotateFile({
                filename: path.join(logDir, "%DATE%.log"),
                datePattern: "YYYY-MM-DD",
                maxSize: "20m",
                maxFiles: "30d"
            }),

            // Console
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    logFormat
                )
            })
        ]
    });
};


const logger = createLogger();

module.exports = logger;