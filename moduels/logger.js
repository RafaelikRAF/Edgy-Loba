const { format } = require("winston");
const winston = require("winston");

const customFormat = winston.format.printf(({ level, message, timestamp, command, discordID, guildID }) => {
	return `[${command}][${guildID}][${timestamp}]${level}: ${message}`;
});

const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(
		winston.format.timestamp({
			format: "DD-MM-YYYY HH:mm:ss",
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.simple(),
		winston.format.json(),
	),

	transports: [
		new winston.transports.Console({
			format: format.combine(
				winston.format.timestamp({
					format: "DD-MM-YYYY HH:mm:ss",
				}),
				winston.format.colorize(),
				customFormat,
			),
		}),
		new winston.transports.File({ filename: "./logs/combined.log" }),
	],
});

module.exports = {
	logger,
};