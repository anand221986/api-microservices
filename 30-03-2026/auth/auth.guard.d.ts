import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class AuthGuard implements CanActivate {
    private readonly config;
    private readonly secretKey;
    constructor(config: ConfigService);
    canActivate(context: ExecutionContext): boolean;
    private extractTokenFromHeader;
}
