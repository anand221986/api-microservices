export declare class CreateEmailSignatureDto {
    user_id: number;
    name: string;
    lastName?: string;
    designation?: string;
    company?: string;
    phone: string;
    mobile?: string;
    email: string;
    website?: string;
    address?: string;
    templateId?: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        youtube?: string;
    };
    platform?: string;
    logo_url?: string;
    logoBase64?: string;
    custom_html?: string;
    id?: number;
    is_default?: boolean;
}
export declare class UpdateEmailSignatureDto {
    name?: string;
    last_name?: string;
    designation?: string;
    company?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    logo_url?: string;
    logoBase64?: string;
    custom_html?: string;
    template_id?: string;
    social_links?: {
        twitter?: string;
        youtube?: string;
        facebook?: string;
        linkedin?: string;
        instagram?: string;
    };
    platform?: string;
    id: number;
    user_id: number;
    mobile?: string;
    is_default?: boolean;
}
