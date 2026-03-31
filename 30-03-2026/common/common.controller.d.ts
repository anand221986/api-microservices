import { Response } from "express";
import { CommonService } from "./common.service";
import { AddProspectDto } from "./common.dto";
import { ContactFormDto, UserSkill } from "./common.dto";
export declare class CommonController {
    service: CommonService;
    constructor(service: CommonService);
    getAllQueries(res: Response): Promise<void>;
    getAll(res: Response): Promise<Response<any, Record<string, any>>>;
    submitContactForm(contactFormDto: ContactFormDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserSkills(res: Response): Promise<Response<any, Record<string, any>>>;
    addSkill(userSkill: UserSkill, res: Response): Promise<Response<any, Record<string, any>>>;
    addcandidate(userSkill: UserSkill, res: Response): Promise<Response<any, Record<string, any>>>;
    addemployer(userSkill: UserSkill, res: Response): Promise<Response<any, Record<string, any>>>;
    addProspect(dto: AddProspectDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
