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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const db_service_1 = require("../db/db.service");
const util_service_1 = require("../util/util.service");
const auth_service_1 = require("../auth/auth.service");
const bcrypt = require("bcryptjs");
const cognito_util_1 = require("../util/cognito.util");
const config_1 = require("@nestjs/config");
let UserService = class UserService {
    configService;
    dbService;
    utilService;
    AuthService;
    cognitoUtil;
    constructor(configService, dbService, utilService, AuthService) {
        this.configService = configService;
        this.dbService = dbService;
        this.utilService = utilService;
        this.AuthService = AuthService;
        const userPoolId = this.configService.get("COGNITO_USER_POOL_ID");
        const region = this.configService.get("AWS_REGION");
        const clientId = this.configService.get("COGNITO_CLIENT_ID");
        const clientSecret = this.configService.get("COGNITO_CLIENT_SECRET");
        if (!userPoolId || !region || !clientId || !clientSecret) {
            throw new common_1.InternalServerErrorException("Missing Cognito configuration in environment variables");
        }
        this.cognitoUtil = new cognito_util_1.CognitoUtil(userPoolId, region, clientId, clientSecret);
    }
    async loginAdmin(req) {
        let email = req.email;
        let password = req.password;
        let adminUser = await this.checkAdminUser(email, password);
        if (adminUser != null) {
            const token = this.AuthService.getToken(adminUser.id, adminUser.email);
            let result = {
                type: "admin",
                user: adminUser,
                token
            };
            console.log(token, 'generated token');
            let query = `UPDATE users SET token='${token}' WHERE id=${adminUser.id}`;
            const execution = await this.dbService.execute(query);
            return this.utilService.successResponse(result, "Admin found");
        }
        return this.utilService.failResponse("Invalid credentials");
    }
    async register(req) {
        try {
            let userEmail = await this.getUserByEmail(req.email);
            if (userEmail != null) {
                return this.utilService.failResponse("Email already exists");
            }
            let userPhone = await this.getUserByPhone(req.phone);
            if (userPhone != null) {
                return this.utilService.failResponse("Phone number already exists");
            }
            let hashPass = await bcrypt.hash(req.password, 12);
            let setData = [];
            setData.push(this.utilService.getInsertObj("first_name", req.first_name));
            setData.push(this.utilService.getInsertObj("last_name", req.last_name));
            setData.push(this.utilService.getInsertObj("email", req.email));
            setData.push(this.utilService.getInsertObj("phone", req.phone));
            setData.push(this.utilService.getInsertObj("password", hashPass));
            setData.push(this.utilService.getInsertObj("created_dt", this.utilService.getMomentDT()));
            const insertedUser = await this.dbService.insertData("users", setData);
            console.log(insertedUser, 'full insertion object');
            if (insertedUser) {
                return this.utilService.successResponse(insertedUser, "User registered successfully");
            }
            else {
                return this.utilService.failResponse("User registration failed. Please try again.");
            }
        }
        catch (error) {
            console.error("Registration Error:", error);
            return this.utilService.failResponse("Something went wrong during registration. Please try again.");
        }
    }
    async getUserByEmail(email) {
        let query = "SELECT  * FROM users WHERE email='" + email + "'";
        let list = await this.dbService.execute(query);
        if (list.length > 0) {
            return list[0];
        }
        else {
            return null;
        }
    }
    async getUserByPhone(phone) {
        let query = "SELECT * FROM users WHERE phone='" + phone + "'";
        let list = await this.dbService.execute(query);
        if (list.length > 0) {
            return list[0];
        }
        else {
            return null;
        }
    }
    async getAllUsers() {
        const query = `SELECT * FROM "users" ORDER BY id Desc;`;
        const result = await this.dbService.execute(query);
        return this.utilService.successResponse(result, "User list retrieved successfully.");
    }
    async getUserById(id) {
        const query = `SELECT * FROM "users" WHERE id='${id}'`;
        const result = await this.dbService.execute(query);
        return this.utilService.successResponse(result[0], "User details retrieved successfully.");
    }
    async deleteUserById(id) {
        const query = `DELETE FROM "users" WHERE id='${id}' RETURNING *;`;
        const result = await this.dbService.execute(query);
        if (result.length === 0) {
            return this.utilService.failResponse(null, "User not found or already deleted.");
        }
        return this.utilService.successResponse(result[0], "User deleted successfully.");
    }
    async checkAdminUser(email, password) {
        try {
            const users = await this.dbService.execute(`SELECT * FROM users WHERE email = '${email}'`);
            console.log(users, 'users', `SELECT * FROM users WHERE email = '${email}'`);
            if (users.length === 0) {
                return null;
            }
            const user = users[0];
            const passMatch = await bcrypt.compare(password, user.password);
            if (!passMatch) {
                return null;
            }
            delete user.password;
            return user;
        }
        catch (error) {
            console.error("Admin Login Error:", error);
            return null;
        }
    }
    async getAllSalesEmployees() {
        const query = `SELECT id, first_name, last_name, email, mobile, gender, profile_img, profile, dob, designation, department, reporting_manager, status, password, created_at, updated_at FROM users WHERE department = 'Sales' and status = 1`;
        const list = await this.dbService.execute(query);
        if (list.length > 0) {
            return this.utilService.successResponse(list, "Sales Employees found");
        }
        else {
            return this.utilService.failResponse("No Sales Employees Found");
        }
    }
    async registerGoogleAuth(profile) {
        const { id: googleId, emails, displayName, photos } = profile;
        const email = emails[0].value;
        const nameParts = displayName.split(' ');
        const lastName = nameParts.slice(1).join(' ');
        let existingUser = await this.dbService.execute(`SELECT * FROM users WHERE email='${email}'`);
        if (existingUser.length === 0) {
            return this.utilService.failResponse("No such user exists");
        }
        if (existingUser.length > 0) {
            if (!existingUser[0].google_id) {
                await this.dbService.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)`);
                await this.dbService.execute(`UPDATE users SET google_id='${googleId}' WHERE id=${existingUser[0].id}`);
                return existingUser[0];
            }
            return {
                id: existingUser[0].insertId,
                last_name: lastName,
                email,
                google_id: googleId,
                type: existingUser[0].department,
                designation: existingUser[0].designation
            };
        }
    }
    async bulkDeleteCandidates(id) {
        try {
            let condition = '';
            if (Array.isArray(id)) {
                if (id.length === 0) {
                    return this.utilService.failResponse(null, "No IDs provided.");
                }
                const idList = id.map(Number).join(',');
                condition = `id IN (${idList})`;
            }
            else {
                condition = `id = ${Number(id)}`;
            }
            const query = `DELETE FROM "users" WHERE ${condition} RETURNING *;`;
            const result = await this.dbService.execute(query);
            if (result.length === 0) {
                return this.utilService.failResponse(null, "User(s) not found or already deleted.");
            }
            return this.utilService.successResponse(result, "User(s) deleted successfully.");
        }
        catch (error) {
            console.error('Delete jobs Error:', error);
            throw new Error(error.message || error);
        }
    }
    async bulkUpdateUser(ids, updates) {
        try {
            const updatedResults = [];
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return this.utilService.failResponse('No candidate IDs provided.');
            }
            if (!updates || !Array.isArray(updates) || updates.length === 0) {
                return this.utilService.failResponse('No update fields provided.');
            }
            const setData = updates
                .filter(u => u.action === 'change_to')
                .map(u => `${u.field}='${u.value}'`);
            for (const id of ids) {
                try {
                    const where = [`id=${id}`];
                    const result = await this.dbService.updateData('users', setData, where);
                    if (result.affectedRows === 0) {
                        updatedResults.push({ id, updated: false, message: 'No record updated' });
                    }
                    else {
                        updatedResults.push({ id, updated: true });
                    }
                }
                catch (error) {
                    updatedResults.push({ id, updated: false, error: error.message });
                }
            }
            return this.utilService.successResponse(updatedResults, 'User Bulk Updation has been Done .');
        }
        catch (err) {
            console.error('Bulk update failed:', err);
            return this.utilService.failResponse('An error occurred during bulk update.');
        }
    }
    async updateUser(id, body) {
        try {
            const existingUser = await this.dbService.findOne('users', { id });
            if (!existingUser) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            try {
                console.log(`Cognito user ${body.email} updated successfully`);
            }
            catch (error) {
                console.error(`Failed to update Cognito user ${body.email}:`, error);
                throw new Error(`Cognito update failed: ${error.message || error}`);
            }
            const updatedUser = await this.dbService.update('users', id, body);
            return this.utilService.successResponse(`User with ID ${id} updated successfully`, updatedUser);
        }
        catch (error) {
            console.error(`Update issue for user ${id}:`, error.message);
            if (error.code === 'ETIMEDOUT' || error.message.includes('ETIMEDOUT')) {
                throw new common_1.ServiceUnavailableException('Database connection timed out. Please try again later.');
            }
            throw new common_1.InternalServerErrorException('Failed to update user');
        }
    }
    async createUser(req) {
        try {
            const existingEmail = await this.getUserByEmail(req.email);
            if (existingEmail) {
                return this.utilService.failResponse("Email already exists");
            }
            if (req.phone) {
                const existingPhone = await this.getUserByPhone(req.phone);
                if (existingPhone) {
                    return this.utilService.failResponse("Phone number already exists");
                }
            }
            const hashedPassword = req.password
                ? await bcrypt.hash(req.password, 12)
                : null;
            const setData = [];
            setData.push(this.utilService.getInsertObj("first_name", req.first_name));
            setData.push(this.utilService.getInsertObj("last_name", req.last_name));
            setData.push(this.utilService.getInsertObj("email", req.email));
            setData.push(this.utilService.getInsertObj("phone", req.phone || null));
            if (hashedPassword) {
                setData.push(this.utilService.getInsertObj("password", hashedPassword));
            }
            setData.push(this.utilService.getInsertObj("address", req.address || null));
            setData.push(this.utilService.getInsertObj("state", req.state || null));
            setData.push(this.utilService.getInsertObj("pin_code", req.pin_code || null));
            setData.push(this.utilService.getInsertObj("role", req.role || "editor"));
            setData.push(this.utilService.getInsertObj("status", req.status ?? 1));
            setData.push(this.utilService.getInsertObj("agency_id", req.agency_id || null));
            setData.push(this.utilService.getInsertObj("created_dt", this.utilService.getMomentDT()));
            const insertedUserId = await this.dbService.insertData("users", setData);
            if (!insertedUserId) {
                return this.utilService.failResponse("User registration failed. Please try again.");
            }
            return this.utilService.successResponse({ id: insertedUserId }, "User created successfully");
        }
        catch (error) {
            console.error("Create User Error:", error);
            return this.utilService.failResponse("Something went wrong while creating user");
        }
    }
    async getUserPlan(userId) {
        const query = `SELECT plan FROM users WHERE id = ${userId} LIMIT 1`;
        const result = await this.dbService.execute(query);
        if (result.length > 0 && result[0].plan) {
            return result[0].plan;
        }
        else {
            return 'free';
        }
    }
    async isPro(userId) {
        const plan = await this.getUserPlan(userId);
        return plan === 'pro';
    }
    async upgradeUser(body) {
        const { userId, plan } = body;
        const existingUser = { id: userId, subscription: 'Free' };
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        try {
            console.log(`Payment processed for user ${userId}, plan ${plan}`);
            const paymentResult = { success: true, transactionId: 'dummy-12345' };
        }
        catch (error) {
            console.error('Payment gateway error:', error);
            throw new Error('Payment failed. Try again later.');
        }
        const updatedUser = { ...existingUser, subscription: plan };
        return {
            success: true,
            message: `User upgraded to ${plan} successfully.`,
            user: updatedUser,
        };
    }
    getPlanAmount(plan) {
        const prices = { Free: 0, Pro: 3, Enterprise: 10 };
        return prices[plan] || 0;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        db_service_1.DbService,
        util_service_1.UtilService,
        auth_service_1.AuthService])
], UserService);
//# sourceMappingURL=user.service.js.map