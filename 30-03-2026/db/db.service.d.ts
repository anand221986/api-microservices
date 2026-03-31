import { InsertionDTO } from "../dto/InsertionDTO";
import { UpdateDTO } from "../dto/UpdateDTO";
import { UtilService } from "../util/util.service";
export declare class DbService {
    private utilService;
    private pool;
    constructor(utilService: UtilService);
    private createConnectionPool;
    private runQuery;
    private prepareQuery;
    execute(queryStr: string): Promise<any>;
    getById(queryStr: string): Promise<any>;
    insertData(tableName: string, data: {
        set: string;
        value: string | boolean | number | null;
    }[]): Promise<InsertionDTO>;
    upsertData(tableName: string, data: {
        set: string;
        value: any;
    }[], conflictFields: string[], updateFields?: string[]): Promise<InsertionDTO>;
    getInsertQuery(tableName: string, data: {
        set: string;
        value: string;
    }[]): string;
    updateQuery(tableName: string, set: string[], where: string[]): string;
    updateData(tableName: string, set: string[], where: string[]): Promise<UpdateDTO>;
    updateOcrData(tableName: string, set: {
        set: string;
        value: string;
    }[], where: {
        set: string;
        value: string;
    }[]): Promise<UpdateDTO>;
    findOne(table: string, conditions: Record<string, any>): Promise<any>;
    update(table: string, id: number, data: Record<string, any>): Promise<any>;
    executeQuery<T = any>(query: string, params?: any[]): Promise<T[]>;
}
