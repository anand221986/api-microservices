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
exports.CommonController = void 0;
const common_1 = require("@nestjs/common");
const common_service_1 = require("./common.service");
const common_dto_1 = require("./common.dto");
const common_dto_2 = require("./common.dto");
const swagger_1 = require("@nestjs/swagger");
let CommonController = class CommonController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getAllQueries(res) {
        res.status(common_1.HttpStatus.OK).json("hello");
    }
    async getAll(res) {
        let data = await this.service.getDashboardStats();
        return res.status(common_1.HttpStatus.OK).json(data);
    }
    async submitContactForm(contactFormDto, res) {
        try {
            const result = await this.service.storeLead(contactFormDto);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Contact form submission error:', error);
            return res.status(500).json({
                status: false,
                message: error.message || 'Failed to submit contact form',
                error: 'Internal Server Error',
            });
        }
    }
    async getUserSkills(res) {
        try {
            const skills = await this.service.getUserSkills();
            return res.status(200).json({ data: skills });
        }
        catch (error) {
            console.error("Error fetching user skills:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    async addSkill(userSkill, res) {
        try {
            const result = await this.service.addUserSkill(userSkill);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Contact form submission error:', error);
            return res.status(500).json({
                status: false,
                message: error.message || 'Failed to submit contact form',
                error: 'Internal Server Error',
            });
        }
    }
    async addcandidate(userSkill, res) {
        try {
            const result = await this.service.addcandidate(common_dto_1.AddCandidateDto);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Add Candidate  form submission error:', error);
            return res.status(500).json({
                status: false,
                message: error.message || 'Failed to submit contact form',
                error: 'Internal Server Error',
            });
        }
    }
    async addemployer(userSkill, res) {
        try {
            const result = await this.service.addEmployer(common_dto_1.AddEmployerDto);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Add Candidate  form submission error:', error);
            return res.status(500).json({
                status: false,
                message: error.message || 'Failed to submit contact form',
                error: 'Internal Server Error',
            });
        }
    }
    async addProspect(dto, res) {
        try {
            const result = await this.service.addProspect(dto);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Add prospects submission error:', error);
            return res.status(500).json({
                status: false,
                message: error.message || 'Failed to submit add prospects',
                error: 'Internal Server Error',
            });
        }
    }
};
exports.CommonController = CommonController;
__decorate([
    (0, common_1.Get)("hello"),
    (0, swagger_1.ApiOperation)({
        summary: "Submit a landing query",
        description: "Endpoint for users to submit landing page queries.",
    }),
    (0, swagger_1.ApiBody)({
        description: "Request body for submitting a landing query",
        type: common_dto_2.SubmitLandingQueryDto,
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getAllQueries", null);
__decorate([
    (0, common_1.Get)("getDashboardStats"),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Dashboard' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)("addLead"),
    (0, swagger_1.ApiOperation)({ summary: 'Submit contact form' }),
    (0, swagger_1.ApiBody)({ type: common_dto_2.ContactFormDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_dto_2.ContactFormDto, Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "submitContactForm", null);
__decorate([
    (0, common_1.Get)("getSkills"),
    (0, swagger_1.ApiOperation)({ summary: 'Get all user skills' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getUserSkills", null);
__decorate([
    (0, common_1.Post)("addskills"),
    (0, swagger_1.ApiOperation)({ summary: 'Add Skills' }),
    (0, swagger_1.ApiBody)({ type: common_dto_2.UserSkill }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_dto_2.UserSkill, Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "addSkill", null);
__decorate([
    (0, common_1.Post)("addcandidate"),
    (0, swagger_1.ApiOperation)({ summary: 'Add Candidate' }),
    (0, swagger_1.ApiBody)({ type: common_dto_1.AddCandidateDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_dto_2.UserSkill, Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "addcandidate", null);
__decorate([
    (0, common_1.Post)("addemployer"),
    (0, swagger_1.ApiOperation)({ summary: 'Add Employer' }),
    (0, swagger_1.ApiBody)({ type: common_dto_1.AddEmployerDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_dto_2.UserSkill, Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "addemployer", null);
__decorate([
    (0, common_1.Post)('addprospect'),
    (0, swagger_1.ApiOperation)({ summary: 'Add Prospects' }),
    (0, swagger_1.ApiBody)({ type: common_dto_1.AddProspectDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_dto_1.AddProspectDto, Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "addProspect", null);
exports.CommonController = CommonController = __decorate([
    (0, common_1.Controller)("common"),
    __metadata("design:paramtypes", [common_service_1.CommonService])
], CommonController);
//# sourceMappingURL=common.controller.js.map