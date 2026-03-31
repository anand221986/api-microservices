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
exports.MailMergeSendDto = exports.CreateMailMergeJobDto = exports.CreateEmailTemplateDto = exports.UpdateEmailTemplateDto = exports.SendMailMergeDto = exports.MailMergeRecipientDto = void 0;
const class_validator_1 = require("class-validator");
class MailMergeRecipientDto {
    email;
    data;
}
exports.MailMergeRecipientDto = MailMergeRecipientDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], MailMergeRecipientDto.prototype, "email", void 0);
class SendMailMergeDto {
    subject;
    template;
    recipients;
}
exports.SendMailMergeDto = SendMailMergeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMailMergeDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMailMergeDto.prototype, "template", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SendMailMergeDto.prototype, "recipients", void 0);
class UpdateEmailTemplateDto {
    name;
    subject;
    body;
}
exports.UpdateEmailTemplateDto = UpdateEmailTemplateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmailTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmailTemplateDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmailTemplateDto.prototype, "body", void 0);
class CreateEmailTemplateDto {
    name;
    subject;
    body;
    user_id;
}
exports.CreateEmailTemplateDto = CreateEmailTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailTemplateDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailTemplateDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmailTemplateDto.prototype, "user_id", void 0);
class CreateMailMergeJobDto {
    template_id;
    total;
}
exports.CreateMailMergeJobDto = CreateMailMergeJobDto;
class MailMergeSendDto {
    emails;
    subject;
    body;
}
exports.MailMergeSendDto = MailMergeSendDto;
//# sourceMappingURL=mail-merge.dto.js.map