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
exports.CommonService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../db/db.service");
const util_service_1 = require("../util/util.service");
let CommonService = class CommonService {
    dbService;
    utilService;
    jobs = [];
    constructor(dbService, utilService) {
        this.dbService = dbService;
        this.utilService = utilService;
    }
    async getDashboardStats() {
        const query = `
    SELECT 
      (SELECT COUNT(*) FROM client ) AS active_clients,
      (SELECT COUNT(*) FROM jobs ) AS active_jobs,
      (SELECT COUNT(*) FROM candidates) AS total_candidates;
  `;
        const result = await this.dbService.execute(query);
        const row = result[0];
        const response = [
            {
                title: "Active Clients",
                value: row.active_clients,
                change: "+2 new this month",
                icon: "Building2",
                trend: "up",
            },
            {
                title: "Active Jobs",
                value: row.active_jobs,
                change: "+12% from last month",
                icon: "Briefcase",
                trend: "up",
            },
            {
                title: "Total Candidates",
                value: row.total_candidates,
                change: "+5% from last month",
                icon: "Users",
                trend: "up",
            },
            {
                title: "Placement Rate",
                value: "23%",
                change: "+3% from last quarter",
                icon: "TrendingUp",
                trend: "up",
            },
        ];
        return this.utilService.successResponse(response, "Dashboard stats retrieved successfully.");
    }
    async storeLead(leadData) {
        try {
            const setData = [
                { set: 'name', value: String(leadData.name) },
                { set: 'email', value: String(leadData.email) },
                { set: 'subject', value: String(leadData.subject) },
                { set: 'phone', value: String(leadData.phone ?? '') },
                { set: 'message', value: String(leadData.message) },
                { set: 'company', value: String(leadData.company) },
                { set: 'created_at', value: new Date().toISOString() },
            ];
            const insertion = await this.dbService.insertData('contact_forms', setData);
            return this.utilService.successResponse(insertion, 'Thank you for contacting us!');
        }
        catch (error) {
            throw new Error('Failed to submit your inquiry.');
        }
    }
    async addUserSkill(UserSkill) {
        try {
            const setData = [
                { set: 'skill', value: String(UserSkill.skill) },
                { set: 'created_at', value: new Date().toISOString() },
            ];
            const insertion = await this.dbService.insertData('user_skills', setData);
            return this.utilService.successResponse(insertion, 'Skill Add Successfully.');
        }
        catch (error) {
            throw new Error('Failed to submit your inquiry.');
        }
    }
    async getUserSkills() {
        const query = `SELECT * FROM user_skills`;
        const result = await this.dbService.execute(query);
        return this.utilService.successResponse(result, "Job Skills retrieved successfully.");
    }
    async addcandidate(UserSkill) {
        try {
            const setData = [
                { set: 'skill', value: String(UserSkill.skill) },
                { set: 'created_at', value: new Date().toISOString() },
            ];
            const insertion = await this.dbService.insertData('user_skills', setData);
            return this.utilService.successResponse(insertion, 'Skill Add Successfully.');
        }
        catch (error) {
            throw new Error('Failed to submit your inquiry.');
        }
    }
    async addEmployer(UserSkill) {
        try {
            const setData = [
                { set: 'skill', value: String(UserSkill.skill) },
                { set: 'created_at', value: new Date().toISOString() },
            ];
            const insertion = await this.dbService.insertData('user_skills', setData);
            return this.utilService.successResponse(insertion, 'Skill Add Successfully.');
        }
        catch (error) {
            throw new Error('Failed to submit your inquiry.');
        }
    }
    async addProspect(dto) {
        const setData = [
            { set: 'full_name', value: dto.fullName },
            { set: 'company_name', value: dto.companyName },
            { set: 'email', value: dto.email },
            { set: 'phone_number', value: dto.phoneNumber || null },
            { set: 'role_to_fill', value: dto.roleToFill || null },
            { set: 'job_type', value: dto.jobType || null },
            { set: 'message', value: dto.message || null },
            { set: 'client_type', value: 'prospect' },
            { set: 'created_dt', value: new Date().toISOString() },
        ];
        const inserted = await this.dbService.insertData('client', setData);
        return { success: true, message: 'Prospect added and emails sent.' };
    }
};
exports.CommonService = CommonService;
exports.CommonService = CommonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService,
        util_service_1.UtilService])
], CommonService);
//# sourceMappingURL=common.service.js.map