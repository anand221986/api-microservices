"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const util_service_1 = require("../../util/util.service");
const redis_1 = require("redis");
const db_service_1 = require("../../db/db.service");
let RedisService = class RedisService {
    utilService;
    dbService;
    client;
    constructor(utilService, dbService) {
        this.utilService = utilService;
        this.dbService = dbService;
    }
    async connectRedis() {
        if (!this.utilService.checkValue(this.client)) {
            this.client = (0, redis_1.createClient)();
            this.client.on("error", err => console.log("Redis Client Error", err));
            await this.client.connect();
        }
    }
    async storeValue(key, value) {
        if (!this.utilService.checkValue(this.client)) {
            this.connectRedis();
        }
        await this.client.set(key, value);
    }
    async getValue(key) {
        if (!this.utilService.checkValue(this.client)) {
            this.connectRedis();
        }
        return await this.client.get(key);
    }
    async clearRedisByKey(key) {
        if (!this.utilService.checkValue(this.client)) {
            this.connectRedis();
        }
        await this.client.set(key, "");
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [util_service_1.UtilService,
        db_service_1.DbService])
], RedisService);
//# sourceMappingURL=redis.service.js.map