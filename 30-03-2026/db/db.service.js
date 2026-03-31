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
exports.DbService = void 0;
const common_1 = require("@nestjs/common");
const util_service_1 = require("../util/util.service");
const pg_1 = require("pg");
let DbService = class DbService {
    utilService;
    pool;
    constructor(utilService) {
        this.utilService = utilService;
        this.createConnectionPool();
    }
    createConnectionPool() {
        try {
            this.pool = new pg_1.Pool({
                host: this.utilService.DB_HOST,
                user: this.utilService.DB_USER,
                port: this.utilService.DB_PORT,
                password: this.utilService.DB_PASSWORD,
                database: this.utilService.DB_DATABASE,
                max: 30,
            });
            this.pool.on('connect', () => {
                console.log('PostgreSQL pool connected');
            });
            this.pool.on('error', (err) => {
                console.error('PostgreSQL Pool Error:', err);
            });
        }
        catch (error) {
            console.error('Error creating PostgreSQL pool:', error);
        }
    }
    async runQuery(query, values = []) {
        try {
            const res = await this.pool.query(query, values);
            return res.rows;
        }
        catch (error) {
            console.error("DB Error:", error);
            throw error;
        }
    }
    prepareQuery(query) {
        const values = [];
        const prepared = query
            .replace(/='([^']*)'/g, (_, val) => {
            values.push(val);
            return "= ?";
        })
            .replace(/IN\s?\(([^)]+)\)/g, (_, group) => {
            const items = group.split(",").map((v) => v.trim().replace(/^'|'$/g, ""));
            values.push(...items);
            return `IN (${items.map(() => "?").join(", ")})`;
        })
            .replace(/BETWEEN\s?'([^']+)'\s?AND\s?'([^']+)'/g, (_, from, to) => {
            values.push(from, to);
            return "BETWEEN ? AND ?";
        });
        return { query: prepared, values };
    }
    async execute(queryStr) {
        const values = [];
        const preparedStatement = queryStr.replace(/='([^']*)'/g, (_, val) => {
            values.push(val);
            return `= $${values.length}`;
        });
        try {
            const result = await this.pool.query(preparedStatement, values);
            return result.rows;
        }
        catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }
    async getById(queryStr) {
        const result = await this.execute(queryStr);
        return result?.[0] ?? null;
    }
    async insertData(tableName, data) {
        const columns = data.map((d) => `"${d.set}"`);
        const placeholders = data.map((_, i) => `$${i + 1}`);
        const values = data.map((d) => d.value);
        const query = `INSERT INTO "${tableName}" (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
        console.log(query, 'query');
        try {
            const result = await this.pool.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            console.error("Insert Error:", error);
            throw error;
        }
    }
    async upsertData(tableName, data, conflictFields, updateFields) {
        const columns = data.map((d) => `"${d.set}"`);
        const placeholders = data.map((_, i) => `$${i + 1}`);
        const values = data.map((d) => d.value);
        const fieldsToUpdate = updateFields ?? data.map((d) => d.set).filter((col) => !conflictFields.includes(col));
        const updateClause = fieldsToUpdate
            .map((col) => `"${col}" = EXCLUDED."${col}"`)
            .join(", ");
        const query = `
    INSERT INTO "${tableName}" (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    ON CONFLICT (${conflictFields.map((f) => `"${f}"`).join(", ")})
    DO UPDATE SET ${updateClause}
    RETURNING *;
  `;
        try {
            const result = await this.pool.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            console.error("Upsert Error:", error);
            throw error;
        }
    }
    getInsertQuery(tableName, data) {
        const columns = data.map((d) => `\`${d.set}\``).join(", ");
        const values = data.map((d) => `'${d.value}'`).join(", ");
        return `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values})`;
    }
    updateQuery(tableName, set, where) {
        const setClause = set.join(", ");
        const whereClause = where.join(" AND ");
        console.log(`UPDATE "${tableName}" SET ${setClause} WHERE ${whereClause}`);
        return `UPDATE "${tableName}" SET ${setClause} WHERE ${whereClause}`;
    }
    updateData(tableName, set, where) {
        const query = this.updateQuery(tableName, set, where);
        return new Promise((resolve) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    resolve({
                        fieldCount: 0,
                        affectedRows: 0,
                        insertId: 0,
                        serverStatus: 0,
                        warningCount: 0,
                        message: error.message,
                        protocol41: true,
                        changedRows: 0,
                        code: error.code,
                    });
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    updateOcrData(tableName, set, where) {
        const setClause = set.map((s) => `\`${s.set}\` = '${s.value}'`).join(", ");
        const whereClause = where.map((w) => `\`${w.set}\` = '${w.value}'`).join(" AND ");
        const query = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${whereClause}`;
        return this.updateData(tableName, [setClause], [whereClause]);
    }
    async findOne(table, conditions) {
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        const whereClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(' AND ');
        const query = `SELECT * FROM "${table}" WHERE ${whereClause} LIMIT 1`;
        console.log(query);
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }
    async update(table, id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        if (keys.length === 0) {
            throw new Error('No fields to update');
        }
        const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
        const query = `
      UPDATE "${table}"
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *;
    `;
        console.log(query);
        const result = await this.pool.query(query, [...values, id]);
        return result.rows[0];
    }
    async executeQuery(query, params = []) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(query, params);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
};
exports.DbService = DbService;
exports.DbService = DbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [util_service_1.UtilService])
], DbService);
//# sourceMappingURL=db.service.js.map