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
exports.EmailSignatureService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../db/db.service");
const util_service_1 = require("../util/util.service");
const user_service_1 = require("../user/user.service");
let EmailSignatureService = class EmailSignatureService {
    dbService;
    utilService;
    usersService;
    constructor(dbService, utilService, usersService) {
        this.dbService = dbService;
        this.utilService = utilService;
        this.usersService = usersService;
    }
    async create(dto) {
        try {
            const isPro = true;
            if (!isPro) {
                const existingSignatures = await this.getSignatures(dto.user_id);
                if (existingSignatures.length >= 1) {
                    throw new common_1.ForbiddenException('Upgrade to Pro for multiple signatures');
                }
            }
            const query = `INSERT INTO email_signatures(
    user_id, name, last_name, designation, company,
    phone, mobile, email, website, address,
    template_id, social_links, platform,
    logo_url, logo_base64, custom_html,is_default
  )
  VALUES
  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
  RETURNING *;`;
            const values = [
                dto.user_id,
                dto.name,
                dto.lastName,
                dto.designation,
                dto.company,
                dto.phone,
                dto.mobile,
                dto.email,
                dto.website,
                dto.address,
                dto.templateId,
                dto.socialLinks ? JSON.stringify(dto.socialLinks) : null,
                dto.platform,
                dto.logo_url,
                dto.logoBase64,
                dto.custom_html,
                !!dto.is_default
            ];
            const [signature] = await this.dbService.executeQuery(query, values);
            return this.utilService.successResponse(signature, 'Email signature created successfully');
        }
        catch (error) {
            console.error(error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create email signature');
        }
    }
    async update(id, dto) {
        await this.findById(id);
        const fields = [];
        const values = [];
        let index = 1;
        for (const [key, value] of Object.entries(dto)) {
            if (value !== undefined) {
                fields.push(`${key} = $${index++}`);
                values.push(value);
            }
        }
        fields.push(`updated_at = NOW()`);
        const query = `
      UPDATE email_signatures
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;
        values.push(id);
        const [updated] = await this.dbService.executeQuery(query, values);
        return this.utilService.successResponse(updated, 'Email signature updated successfully');
    }
    async findById(id) {
        const query = `SELECT *,logo_base64 as logoBase64 FROM email_signatures WHERE id = $1`;
        const result = await this.dbService.executeQuery(query, [id]);
        if (!result.length) {
            throw new common_1.NotFoundException('Email signature not found');
        }
        return result;
    }
    async findByUser(userId) {
        const query = `
      SELECT *,logo_base64 as logoBase64 FROM email_signatures
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
        return this.dbService.executeQuery(query, [userId]);
    }
    async delete(id) {
        const query = `DELETE FROM email_signatures WHERE id = $1 RETURNING *`;
        const result = await this.dbService.executeQuery(query, [id]);
        if (!result.length) {
            throw new common_1.NotFoundException('Email signature not found');
        }
        return this.utilService.successResponse(null, 'Email signature deleted successfully');
    }
    async getSignatures(userId) {
        const query = `SELECT  * FROM email_signatures WHERE user_id = $1`;
        const result = await this.dbService.executeQuery(query, [userId]);
        return result;
    }
};
exports.EmailSignatureService = EmailSignatureService;
exports.EmailSignatureService = EmailSignatureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_service_1.DbService,
        util_service_1.UtilService,
        user_service_1.UserService])
], EmailSignatureService);
//# sourceMappingURL=email-signature.service.js.map