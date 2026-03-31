import { UtilService } from "src/util/util.service";
import { DbService } from "src/db/db.service";
export declare class RedisService {
    private utilService;
    private dbService;
    client: any;
    constructor(utilService: UtilService, dbService: DbService);
    connectRedis(): Promise<void>;
    storeValue(key: any, value: any): Promise<void>;
    getValue(key: any): Promise<any>;
    clearRedisByKey(key: any): Promise<void>;
}
