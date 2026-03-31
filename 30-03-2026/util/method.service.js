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
exports.MethodService = void 0;
const common_1 = require("@nestjs/common");
const util_service_1 = require("./util.service");
const db_service_1 = require("../db/db.service");
const truncate_number_pipe_1 = require("../truncate-number/truncate-number.pipe");
let MethodService = class MethodService {
    utilService;
    dbService;
    truncateNumber;
    constructor(utilService, dbService, truncateNumber) {
        this.utilService = utilService;
        this.dbService = dbService;
        this.truncateNumber = truncateNumber;
    }
};
exports.MethodService = MethodService;
exports.MethodService = MethodService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [util_service_1.UtilService,
        db_service_1.DbService,
        truncate_number_pipe_1.TruncateNumberPipe])
], MethodService);
//# sourceMappingURL=method.service.js.map