export declare class SendWhatsappQuoteDto {
    phone: string;
    message: string;
}
export declare class AddNewsletterDto {
    name: string;
    phone: string;
    email?: string;
    destination?: string;
}
export declare class AddPackageImageDto {
    image: any;
}
export declare class UpdateCurrencyDto {
    value: number;
    id: number;
}
export declare class UploadImageToCdnDto {
    path: string;
}
export declare class AddFixedPackageLeadDto {
    name: string;
    phone: string;
    email: string;
    travel_date: string;
    from_city: string;
    nights?: number;
    adult_count: number;
    child_count: number;
    infant_count: number;
    budget: number;
    source_page: string;
}
export declare class AddPackageCustomizeLeadDto {
    name: string;
    travel_date: string;
    travel_city: string;
    from_city: string;
    phone: string;
    source?: string;
}
export declare class AddUTMSourceDto {
    utm_source: string;
    campaign_id: string;
    ad_group_id: string;
    ad_id: string;
    utm_keyword: string;
    link: string;
    type: string;
    uuid: string;
    user_id: string;
}
export declare class AddQueryDto {
    name: string;
    email: string;
    phone: string;
    from_destination: string;
    to_destination: string;
    travel_date: string;
    page_name: string;
    link: string;
}
export declare class UploadVideoToCDNDto {
    video_url: string;
    name: string;
}
export declare class UploadPassengerImageDto {
    image: string;
}
export declare class SaveCMSDto {
    data: any;
    type: string;
}
export declare class UpdateConstantsDto {
    flight_markup_type: string;
    flight_markup: number;
    hotel_markup_type: string;
    hotel_markup: number;
    transfer_markup_type: string;
    transfer_markup: number;
    activity_markup_type: string;
    activity_markup: number;
    rail_markup_type: string;
    rail_markup: number;
    vas_markup_type: string;
    vas_markup: number;
    gst_type: string;
    gst: number;
    tcs_type: string;
    tcs: number;
    pp_2: number;
    pp_3: number;
}
export declare class SubmitQueryDto {
    name: string;
    phone?: string;
    email: string;
    package_id?: string;
    destination?: string;
    from_destination?: string;
    travel_date?: string;
}
export declare class SubmitLandingQueryDto {
    name: string;
    phone: string;
    destination: string;
    uuid: string;
    source?: string;
    source_remark?: string;
    ad_id?: string;
}
export declare class ContactFormDto {
    name: string;
    email: string;
    subject: string;
    phone?: string;
    message: string;
    company: string;
}
export declare class UserSkill {
    skill: string;
    created_at: Date;
}
export declare class AddCandidateDto {
    phoneNumber: string;
    email: string;
    linkedinUrl: string;
    currentJobTitle: string;
    jobType: string;
    resume: any;
}
export declare class AddEmployerDto {
    phoneNumber: string;
    email: string;
    linkedinUrl: string;
    currentJobTitle: string;
    jobType: string;
    resume: any;
}
export declare class AddProspectDto {
    companyName: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    roleToFill?: string;
    jobType?: string;
    message?: string;
}
