import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AesService } from "../services/aes/aes.service";
import { AuthService } from "src/auth/auth.service";
export declare class ApiMiddleware implements NestMiddleware {
    private aesService;
    private authService;
    private readonly excludedPaths;
    constructor(aesService: AesService, authService: AuthService);
    use(req: Request, res: Response, next: NextFunction): void;
}
