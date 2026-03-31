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
exports.UpgradeUserDto = exports.CreateUserDto = exports.UpdateUserDto = exports.BulkUpdateCandidateDto = exports.UpdateActionDto = exports.BulkDeleteCandidateDto = exports.LoginAdminDto = exports.LoginDto = exports.RegisterDto = exports.UpdateUserProfileDto = exports.AddUserTravellerDto = exports.UpdateUserTravellerDto = exports.CreateCustomerDto = exports.UpdateCustomerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateCustomerDto {
    first_name;
    last_name;
    email;
    phone;
    status;
    id;
}
exports.UpdateCustomerDto = UpdateCustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name of the customer', type: String }),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name of the customer', type: String }),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email of the customer', type: String, format: 'email' }),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number of the customer', type: String }),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status of the customer', type: Number, enum: [0, 1], example: 1 }),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the customer to update', type: String }),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "id", void 0);
class CreateCustomerDto {
    first_name;
    last_name;
    email;
    phone;
    password;
}
exports.CreateCustomerDto = CreateCustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name of the customer', type: String }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name of the customer', type: String }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email of the customer', type: String, format: 'email' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number of the customer', type: String }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Password for the customer', type: String, required: false }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "password", void 0);
class UpdateUserTravellerDto {
    user_id;
    salutation;
    first_name;
    last_name;
    type;
    passport_insurance_date;
    passport_expired_date;
    passport_number;
    pan_number;
    place_of_inssurance;
    date_of_birth;
}
exports.UpdateUserTravellerDto = UpdateUserTravellerDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'The ID of the user associated with the traveller', example: '456' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Salutation for the traveller', example: 'Mr.' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "salutation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'First name of the traveller', example: 'John' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last name of the traveller', example: 'Doe' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Type of traveller', example: 'Adult' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport insurance date', example: '2024-01-01', format: 'date' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "passport_insurance_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport expiration date', example: '2034-01-01', format: 'date' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "passport_expired_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passport number of the traveller', example: 'A1234567' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "passport_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'PAN number of the traveller', example: 'ABCDE1234F' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "pan_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Place where the passport was issued', example: 'New York' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "place_of_inssurance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date of birth of the traveller', example: '1990-05-15', format: 'date' }),
    __metadata("design:type", String)
], UpdateUserTravellerDto.prototype, "date_of_birth", void 0);
class AddUserTravellerDto {
    user_id;
    salutation;
    first_name;
    last_name;
    type;
    passport_insurance_date;
    passport_expired_date;
    passport_number;
    pan_number;
    place_of_inssurance;
    date_of_birth;
}
exports.AddUserTravellerDto = AddUserTravellerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The ID of the user associated with the traveller', example: '456' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Salutation for the traveller', example: 'Mr.' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "salutation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name of the traveller', example: 'John' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name of the traveller', example: 'Doe' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of traveller', example: 'Adult' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Passport insurance date', example: '2024-01-01', format: 'date' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "passport_insurance_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Passport expiration date', example: '2034-01-01', format: 'date' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "passport_expired_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Passport number of the traveller', example: 'A1234567' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "passport_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PAN number of the traveller', example: 'ABCDE1234F' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "pan_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Place where the passport was issued', example: 'New York' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "place_of_inssurance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth of the traveller', example: '1990-05-15', format: 'date' }),
    __metadata("design:type", String)
], AddUserTravellerDto.prototype, "date_of_birth", void 0);
class UpdateUserProfileDto {
    first_name;
    last_name;
    birthday;
    gender;
    marital_status;
    address;
    pin_code;
    state;
}
exports.UpdateUserProfileDto = UpdateUserProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name of the user', example: 'John' }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name of the user', example: 'Doe' }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Birthday of the user', example: '1990-05-15', format: 'date' }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender of the user', example: 'male', enum: ['male', 'female', 'other'] }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Marital status of the user', example: 'single', enum: ['single', 'married', 'divorced'] }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "marital_status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address of the user', example: '123 Main Street' }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pin code of the user', example: '123456' }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "pin_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State of the user', example: 'California' }),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "state", void 0);
class RegisterDto {
    first_name;
    last_name;
    email;
    phone;
    password;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name of the user', example: 'John' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name of the user', example: 'Doe' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email of the user', example: 'john.doe@example.com' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number of the user', example: '1234567890' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'password of the user', example: '12345' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email of the user', example: 'john.doe@example.com' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Password of the user', example: 'password123' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class LoginAdminDto {
    email;
    password;
}
exports.LoginAdminDto = LoginAdminDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin email', example: 'admin@example.com' }),
    __metadata("design:type", String)
], LoginAdminDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin password', example: 'adminpassword123' }),
    __metadata("design:type", String)
], LoginAdminDto.prototype, "password", void 0);
class BulkDeleteCandidateDto {
    data;
}
exports.BulkDeleteCandidateDto = BulkDeleteCandidateDto;
class UpdateActionDto {
    field;
    action;
    value;
}
exports.UpdateActionDto = UpdateActionDto;
class BulkUpdateCandidateDto {
    ids;
    updates;
}
exports.BulkUpdateCandidateDto = BulkUpdateCandidateDto;
class UpdateUserDto {
    name;
    first_name;
    last_name;
    phone;
    email;
    role;
    agency_id;
    status;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "first_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "last_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "agency_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "status", void 0);
class CreateUserDto {
    first_name;
    last_name;
    email;
    phone;
    address;
    pin_code;
    state;
    role;
    status;
    agency_id;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "first_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "last_name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "pin_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "agency_id", void 0);
class UpgradeUserDto {
    userId;
    plan;
}
exports.UpgradeUserDto = UpgradeUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpgradeUserDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpgradeUserDto.prototype, "plan", void 0);
//# sourceMappingURL=user.dto.js.map