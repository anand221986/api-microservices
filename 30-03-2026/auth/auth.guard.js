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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
let AuthGuard = class AuthGuard {
    config;
    secretKey;
    constructor(config) {
        this.config = config;
        this.secretKey = this.config.get('JWT_SECRET') || '';
        if (!this.secretKey) {
            throw new Error('JWT_SECRET is not configured');
        }
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Authorization header is missing');
        }
        const token = this.extractTokenFromHeader(authHeader);
        if (!token) {
            throw new common_1.UnauthorizedException('Token is missing from authorization header');
        }
        try {
            const payload = jwt.verify(token, this.secretKey);
            if (!payload.sub || !payload.email) {
                throw new common_1.UnauthorizedException('Invalid token payload');
            }
            request.user = {
                userId: payload.sub,
                email: payload.email,
                iat: payload.iat,
                jti: payload.jti
            };
            return true;
        }
        catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            if (error instanceof jwt.NotBeforeError) {
                throw new common_1.UnauthorizedException('Token not active yet');
            }
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Token validation failed');
        }
    }
    extractTokenFromHeader(authHeader) {
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer') {
            throw new common_1.UnauthorizedException('Authorization header must be in Bearer format');
        }
        return token || null;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map