export declare class UpdateCustomerDto {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status?: string;
    id: string;
}
export declare class CreateCustomerDto {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password?: string;
}
export declare class UpdateUserTravellerDto {
    user_id?: string;
    salutation?: string;
    first_name?: string;
    last_name?: string;
    type?: string;
    passport_insurance_date?: string;
    passport_expired_date?: string;
    passport_number?: string;
    pan_number?: string;
    place_of_inssurance?: string;
    date_of_birth?: string;
}
export declare class AddUserTravellerDto {
    user_id: string;
    salutation: string;
    first_name: string;
    last_name: string;
    type: string;
    passport_insurance_date: string;
    passport_expired_date: string;
    passport_number: string;
    pan_number: string;
    place_of_inssurance: string;
    date_of_birth: string;
}
export declare class UpdateUserProfileDto {
    first_name: string;
    last_name: string;
    birthday: string;
    gender: string;
    marital_status: string;
    address: string;
    pin_code: string;
    state: string;
}
export declare class RegisterDto {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class LoginAdminDto {
    email: string;
    password: string;
}
export declare class BulkDeleteCandidateDto {
    data: {
        ids: number[];
    };
}
export declare class UpdateActionDto {
    field: string;
    action: 'change_to';
    value: any;
}
export declare class BulkUpdateCandidateDto {
    ids: number[];
    updates: UpdateActionDto[];
}
export declare class UpdateUserDto {
    name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    role?: string;
    agency_id?: number;
    status?: number;
}
export declare class CreateUserDto {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address?: string;
    pin_code?: number;
    state?: string;
    role: string;
    status: number;
    agency_id?: string;
}
export declare class UpgradeUserDto {
    userId: string;
    plan: string;
}
