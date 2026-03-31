import { DbService } from "../db/db.service";
import { UtilService } from "../util/util.service";
import { AddProspectDto } from "./common.dto";
export declare class CommonService {
    dbService: DbService;
    utilService: UtilService;
    private jobs;
    constructor(dbService: DbService, utilService: UtilService);
    getDashboardStats(): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    storeLead(leadData: any): Promise<any>;
    addUserSkill(UserSkill: any): Promise<any>;
    getUserSkills(): Promise<{
        status: boolean;
        message: string;
        result: any;
    }>;
    addcandidate(UserSkill: any): Promise<any>;
    addEmployer(UserSkill: any): Promise<any>;
    addProspect(dto: AddProspectDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
