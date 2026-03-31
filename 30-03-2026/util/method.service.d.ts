import { UtilService } from "src/util/util.service";
import { DbService } from "../db/db.service";
import { TruncateNumberPipe } from "src/truncate-number/truncate-number.pipe";
export declare class MethodService {
    private utilService;
    private dbService;
    private truncateNumber;
    constructor(utilService: UtilService, dbService: DbService, truncateNumber: TruncateNumberPipe);
}
