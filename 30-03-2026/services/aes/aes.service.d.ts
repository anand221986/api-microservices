import { UtilService } from "../../util/util.service";
import { DbService } from "../../db/db.service";
export declare class AesService {
    private utilService;
    private dbService;
    constructor(utilService: UtilService, dbService: DbService);
    encrypt(plainText: any, key: any): any;
    decrypt(data: any, key: any): any;
    decryptPost(data: any): any;
}
