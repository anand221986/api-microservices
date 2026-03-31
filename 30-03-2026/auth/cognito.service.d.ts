export declare class CognitoService {
    signUp(email: string, password: string, role: string): Promise<any>;
    signIn(email: string, password: string): Promise<any>;
}
