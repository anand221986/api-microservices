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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const user_dto_1 = require("./user.dto");
const user_dto_2 = require("./user.dto");
let UserController = class UserController {
    service;
    constructor(service) {
        this.service = service;
    }
    async loginAdmin(body, res) {
        const data = await this.service.loginAdmin(body);
        if (data) {
            return res.status(common_1.HttpStatus.OK).json({ message: data });
        }
        else {
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json({ message: data });
        }
    }
    async register(body, res) {
        let data = await this.service.register(body);
        res.status(common_1.HttpStatus.OK).json(data);
    }
    async getAllUsers(res) {
        const users = await this.service.getAllUsers();
        res.status(common_1.HttpStatus.OK).json(users);
    }
    async getUserById(id, res) {
        const result = await this.service.getUserById(id);
        res.status(common_1.HttpStatus.OK).json(result);
    }
    async updateUser(id, body, res) {
        const updatedPayload = {};
        console.log(body);
        if (body.name) {
            const parts = body.name.trim().split(" ");
            updatedPayload.first_name = parts[0] ?? "";
            updatedPayload.last_name = parts.slice(1).join(" ") || "";
        }
        if (body.email)
            updatedPayload.email = body.email;
        if (body.phone)
            updatedPayload.phone = body.phone;
        if (body.role)
            updatedPayload.role = body.role;
        if (body.agency_id)
            updatedPayload.agency_id = body.agency_id;
        if ("status" in body && body.status !== undefined && body.status !== null) {
            const s = typeof body.status === "string" ? Number(body.status) : body.status;
            if (s === 0 || s === 1)
                updatedPayload.status = s;
        }
        await this.service.updateUser(id, updatedPayload);
        return res
            .status(common_1.HttpStatus.OK)
            .json({ message: `User with id ${id} updated successfully` });
    }
    async deleteUser(id, res) {
        res.status(common_1.HttpStatus.OK).json({ message: `User with id ${id} deleted` });
    }
    async bulkDeleteCandidates(body, res) {
        try {
            const result = await this.service.bulkDeleteCandidates(body.data.ids);
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            console.error('Bulk delete error:', error);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to delete candidates',
                error: error.message,
            });
        }
    }
    async bulkUpdateCandidates(body, res) {
        try {
            const result = await this.service.bulkUpdateUser(body.ids, body.updates);
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            console.error('Bulk update error:', error);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to update candidates',
                error: error.message,
            });
        }
    }
    async createUser(body) {
        return this.service.createUser(body);
    }
    async upgradeUser(body) {
        return this.service.upgradeUser(body);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)("login"),
    (0, swagger_1.ApiOperation)({ summary: "Admin login" }),
    (0, swagger_1.ApiBody)({ type: user_dto_2.LoginAdminDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Admin successfully logged in" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Invalid email or password" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_2.LoginAdminDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "loginAdmin", null);
__decorate([
    (0, common_1.Post)("register"),
    (0, swagger_1.ApiOperation)({
        summary: 'Register a new user',
        description: 'This endpoint registers a new user into the system.',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Request body to register a new user',
        type: user_dto_2.RegisterDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User successfully logged in',
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string', example: 'jwt.token.here' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'User Name' },
                        email: { type: 'string', example: 'user@example.com' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid email or password',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid email or password' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.Get)("getAllUsers"),
    (0, swagger_1.ApiOperation)({ summary: "Get all users" }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get user by ID" }),
    (0, swagger_1.ApiParam)({ name: "id", type: Number }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update a user" }),
    (0, swagger_1.ApiParam)({ name: "id", type: Number }),
    (0, swagger_1.ApiBody)({ type: user_dto_1.UpdateUserDto }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete a user" }),
    (0, swagger_1.ApiParam)({ name: "id", type: Number }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('bulk-delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk deletion of candidates' }),
    (0, swagger_1.ApiBody)({ type: user_dto_2.BulkDeleteCandidateDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_2.BulkDeleteCandidateDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "bulkDeleteCandidates", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update candidates' }),
    (0, swagger_1.ApiBody)({ type: user_dto_2.BulkUpdateCandidateDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_2.BulkUpdateCandidateDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "bulkUpdateCandidates", null);
__decorate([
    (0, common_1.Post)('createUser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Post)('upgrade'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UpgradeUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "upgradeUser", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)("user"),
    (0, common_1.Controller)("user"),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map