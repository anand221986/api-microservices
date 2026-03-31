"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let LoggerMiddleware = class LoggerMiddleware {
    use(req, res, next) {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms\n`;
            const logsDir = path.join(process.cwd(), 'logs');
            const logFilePath = path.join(logsDir, 'response-time.log');
            fs.appendFile(logFilePath, log, (err) => {
                if (err) {
                    console.error('Failed to write log:', err);
                }
            });
        });
        next();
    }
};
exports.LoggerMiddleware = LoggerMiddleware;
exports.LoggerMiddleware = LoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerMiddleware);
//# sourceMappingURL=logger.middleware.js.map