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
exports.ApiMiddleware = void 0;
const common_1 = require("@nestjs/common");
const aes_service_1 = require("../services/aes/aes.service");
const auth_service_1 = require("../auth/auth.service");
let ApiMiddleware = class ApiMiddleware {
    aesService;
    authService;
    excludedPaths = [
        "/user/upload",
        "/user/loginViaOTP",
        "/blog",
        "/package",
        "/common",
        "/career",
        "/store-manager",
        "/order",
        "/places"
    ];
    constructor(aesService, authService) {
        this.aesService = aesService;
        this.authService = authService;
    }
    use(req, res, next) {
        if (req.method == "POST" || req.method == "PUT") {
            if (req.originalUrl == "/places/upload" || req.originalUrl.includes("zohoWBhook")) {
                next();
            }
            else {
                if (req.body.hasOwnProperty("payload_data")) {
                    let payload_data = this.aesService.decryptPost(req.body);
                    if (payload_data) {
                        req.body = JSON.parse(payload_data);
                        next();
                    }
                    else {
                        res.status(common_1.HttpStatus.NOT_FOUND).json({ message: "Please try again later!" });
                    }
                }
                else {
                    res.status(common_1.HttpStatus.NOT_FOUND).json({ message: "Please try again later!" });
                }
            }
        }
        else {
            next();
        }
    }
};
exports.ApiMiddleware = ApiMiddleware;
exports.ApiMiddleware = ApiMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [aes_service_1.AesService, auth_service_1.AuthService])
], ApiMiddleware);
//# sourceMappingURL=api.middleware.js.map