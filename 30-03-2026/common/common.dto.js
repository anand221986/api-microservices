"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProspectDto = exports.AddEmployerDto = exports.AddCandidateDto = exports.UserSkill = exports.ContactFormDto = exports.SubmitLandingQueryDto = exports.SubmitQueryDto = exports.UpdateConstantsDto = exports.SaveCMSDto = exports.UploadPassengerImageDto = exports.UploadVideoToCDNDto = exports.AddQueryDto = exports.AddUTMSourceDto = exports.AddPackageCustomizeLeadDto = exports.AddFixedPackageLeadDto = exports.UploadImageToCdnDto = exports.UpdateCurrencyDto = exports.AddPackageImageDto = exports.AddNewsletterDto = exports.SendWhatsappQuoteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SendWhatsappQuoteDto {
    phone;
    message;
}
exports.SendWhatsappQuoteDto = SendWhatsappQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The phone number to which the quote should be sent.',
        example: '+1234567890',
    }),
    __metadata("design:type", String)
], SendWhatsappQuoteDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The quote message to be sent via WhatsApp.',
        example: 'Here is your quote for the requested service.',
    }),
    __metadata("design:type", String)
], SendWhatsappQuoteDto.prototype, "message", void 0);
class AddNewsletterDto {
    name;
    phone;
    email;
    destination;
}
exports.AddNewsletterDto = AddNewsletterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The name of the subscriber.',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], AddNewsletterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The phone number of the subscriber.',
        example: '+1234567890',
    }),
    __metadata("design:type", String)
], AddNewsletterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The email address of the subscriber (optional).',
        example: 'john.doe@example.com',
    }),
    __metadata("design:type", String)
], AddNewsletterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The destination the subscriber is interested in (optional).',
        example: 'Paris, France',
    }),
    __metadata("design:type", String)
], AddNewsletterDto.prototype, "destination", void 0);
class AddPackageImageDto {
    image;
}
exports.AddPackageImageDto = AddPackageImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The image file associated with the package.',
        type: 'string',
        format: 'binary'
    }),
    __metadata("design:type", Object)
], AddPackageImageDto.prototype, "image", void 0);
class UpdateCurrencyDto {
    value;
    id;
}
exports.UpdateCurrencyDto = UpdateCurrencyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The value of the currency to be updated.',
        type: 'number',
    }),
    __metadata("design:type", Number)
], UpdateCurrencyDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ID of the currency to be updated.',
        type: 'number',
    }),
    __metadata("design:type", Number)
], UpdateCurrencyDto.prototype, "id", void 0);
class UploadImageToCdnDto {
    path;
}
exports.UploadImageToCdnDto = UploadImageToCdnDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL of the image to be uploaded to the CDN',
        example: 'https://example.com/image.jpg',
    }),
    __metadata("design:type", String)
], UploadImageToCdnDto.prototype, "path", void 0);
class AddFixedPackageLeadDto {
    name;
    phone;
    email;
    travel_date;
    from_city;
    nights;
    adult_count;
    child_count;
    infant_count;
    budget;
    source_page;
}
exports.AddFixedPackageLeadDto = AddFixedPackageLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the customer',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], AddFixedPackageLeadDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the customer',
        example: '1234567890',
    }),
    __metadata("design:type", String)
], AddFixedPackageLeadDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the customer',
        example: 'john.doe@example.com',
    }),
    __metadata("design:type", String)
], AddFixedPackageLeadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Travel date',
        example: '2024-12-25',
    }),
    __metadata("design:type", String)
], AddFixedPackageLeadDto.prototype, "travel_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Departure city',
        example: 'New York',
    }),
    __metadata("design:type", String)
], AddFixedPackageLeadDto.prototype, "from_city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of nights for the stay',
        example: 5,
        default: 0,
    }),
    __metadata("design:type", Number)
], AddFixedPackageLeadDto.prototype, "nights", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of adults in the group',
        example: 2,
    }),
    __metadata("design:type", Number)
], AddFixedPackageLeadDto.prototype, "adult_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of children in the group',
        example: 1,
    }),
    __metadata("design:type", Number)
], AddFixedPackageLeadDto.prototype, "child_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of infants in the group',
        example: 0,
    }),
    __metadata("design:type", Number)
], AddFixedPackageLeadDto.prototype, "infant_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Budget for the trip',
        example: 1500,
    }),
    __metadata("design:type", Number)
], AddFixedPackageLeadDto.prototype, "budget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Source page of the lead',
        example: 'USA',
    }),
    __metadata("design:type", String)
], AddFixedPackageLeadDto.prototype, "source_page", void 0);
class AddPackageCustomizeLeadDto {
    name;
    travel_date;
    travel_city;
    from_city;
    phone;
    source;
}
exports.AddPackageCustomizeLeadDto = AddPackageCustomizeLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer name',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], AddPackageCustomizeLeadDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Travel date',
        example: '2024-12-25',
    }),
    __metadata("design:type", String)
], AddPackageCustomizeLeadDto.prototype, "travel_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Travel city',
        example: 'Paris',
    }),
    __metadata("design:type", String)
], AddPackageCustomizeLeadDto.prototype, "travel_city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Departure city',
        example: 'New York',
    }),
    __metadata("design:type", String)
], AddPackageCustomizeLeadDto.prototype, "from_city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the customer',
        example: '1234567890',
    }),
    __metadata("design:type", String)
], AddPackageCustomizeLeadDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional notes or source',
        example: 'Recommended by a friend',
    }),
    __metadata("design:type", String)
], AddPackageCustomizeLeadDto.prototype, "source", void 0);
class AddUTMSourceDto {
    utm_source;
    campaign_id;
    ad_group_id;
    ad_id;
    utm_keyword;
    link;
    type;
    uuid;
    user_id;
}
exports.AddUTMSourceDto = AddUTMSourceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The UTM source',
        example: 'Google',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "utm_source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The campaign ID',
        example: '12345',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "campaign_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ad group ID',
        example: '67890',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "ad_group_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ad ID',
        example: 'abc123',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "ad_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The UTM keyword',
        example: 'sale',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "utm_keyword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The link associated with the UTM source',
        example: 'https://example.com',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "link", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The type of the source',
        example: 'paid',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UUID for the UTM source entry',
        example: 'f43b2fe1-1a77-48ea-91ff-89f36cf69e99',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "uuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID associated with the source',
        example: 'user123',
    }),
    __metadata("design:type", String)
], AddUTMSourceDto.prototype, "user_id", void 0);
class AddQueryDto {
    name;
    email;
    phone;
    from_destination;
    to_destination;
    travel_date;
    page_name;
    link;
}
exports.AddQueryDto = AddQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the user making the query',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], AddQueryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email of the user making the query',
        example: 'johndoe@example.com',
    }),
    __metadata("design:type", String)
], AddQueryDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the user making the query',
        example: '+1234567890',
    }),
    __metadata("design:type", String)
], AddQueryDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'From destination of the query',
        example: 'New York',
    }),
    __metadata("design:type", String)
], AddQueryDto.prototype, "from_destination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'To destination of the query',
        example: 'Los Angeles',
    }),
    __metadata("design:type", String)
], AddQueryDto.prototype, "to_destination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Travel date for the query',
        example: '2024-12-25',
    }),
    __metadata("design:type", String)
], AddQueryDto.prototype, "travel_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Source of the query, like the page name',
        example: 'HomePage',
    }),
    __metadata("design:type", String)
], AddQueryDto.prototype, "page_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Link related to the query',
        example: 'https://example.com',
    }),
    __metadata("design:type", String)
], AddQueryDto.prototype, "link", void 0);
class UploadVideoToCDNDto {
    video_url;
    name;
}
exports.UploadVideoToCDNDto = UploadVideoToCDNDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL of the video to upload to CDN',
        example: 'https://example.com/video.mp4',
    }),
    __metadata("design:type", String)
], UploadVideoToCDNDto.prototype, "video_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the video to upload',
        example: 'Sample Video',
    }),
    __metadata("design:type", String)
], UploadVideoToCDNDto.prototype, "name", void 0);
class UploadPassengerImageDto {
    image;
}
exports.UploadPassengerImageDto = UploadPassengerImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base64 encoded image string of the passenger image',
        example: 'data:image/png;base64,xyz...',
    }),
    __metadata("design:type", String)
], UploadPassengerImageDto.prototype, "image", void 0);
class SaveCMSDto {
    data;
    type;
}
exports.SaveCMSDto = SaveCMSDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The content or data to be saved in CMS',
        type: Object,
    }),
    __metadata("design:type", Object)
], SaveCMSDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The type of CMS content (e.g., "blog", "news")',
        example: 'blog',
    }),
    __metadata("design:type", String)
], SaveCMSDto.prototype, "type", void 0);
class UpdateConstantsDto {
    flight_markup_type;
    flight_markup;
    hotel_markup_type;
    hotel_markup;
    transfer_markup_type;
    transfer_markup;
    activity_markup_type;
    activity_markup;
    rail_markup_type;
    rail_markup;
    vas_markup_type;
    vas_markup;
    gst_type;
    gst;
    tcs_type;
    tcs;
    pp_2;
    pp_3;
}
exports.UpdateConstantsDto = UpdateConstantsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of flight markup', example: 'percentage' }),
    __metadata("design:type", String)
], UpdateConstantsDto.prototype, "flight_markup_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Flight markup value', example: 5.5 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "flight_markup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of hotel markup', example: 'percentage' }),
    __metadata("design:type", String)
], UpdateConstantsDto.prototype, "hotel_markup_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hotel markup value', example: 8 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "hotel_markup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of transfer markup', example: 'fixed' }),
    __metadata("design:type", String)
], UpdateConstantsDto.prototype, "transfer_markup_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transfer markup value', example: 10 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "transfer_markup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of activity markup', example: 'percentage' }),
    __metadata("design:type", String)
], UpdateConstantsDto.prototype, "activity_markup_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activity markup value', example: 12 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "activity_markup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of rail markup', example: 'fixed' }),
    __metadata("design:type", String)
], UpdateConstantsDto.prototype, "rail_markup_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rail markup value', example: 15 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "rail_markup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of VAS markup', example: 'percentage' }),
    __metadata("design:type", String)
], UpdateConstantsDto.prototype, "vas_markup_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'VAS markup value', example: 20 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "vas_markup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GST type', example: 'percentage' }),
    __metadata("design:type", String)
], UpdateConstantsDto.prototype, "gst_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GST value', example: 18 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "gst", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'TCS type', example: 'fixed' }),
    __metadata("design:type", String)
], UpdateConstantsDto.prototype, "tcs_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'TCS value', example: 2 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "tcs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PP value 2', example: 100 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "pp_2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PP value 3', example: 150 }),
    __metadata("design:type", Number)
], UpdateConstantsDto.prototype, "pp_3", void 0);
class SubmitQueryDto {
    name;
    phone;
    email;
    package_id;
    destination;
    from_destination;
    travel_date;
}
exports.SubmitQueryDto = SubmitQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the user', example: 'John Doe' }),
    __metadata("design:type", String)
], SubmitQueryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the user',
        example: '+1234567890',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitQueryDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address of the user', example: 'john.doe@example.com' }),
    __metadata("design:type", String)
], SubmitQueryDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Package ID associated with the query',
        example: 'PKG12345',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitQueryDto.prototype, "package_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Destination of interest',
        example: 'Paris',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitQueryDto.prototype, "destination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Starting point of the trip',
        example: 'New York',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitQueryDto.prototype, "from_destination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred travel date',
        example: '2024-12-25',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitQueryDto.prototype, "travel_date", void 0);
class SubmitLandingQueryDto {
    name;
    phone;
    destination;
    uuid;
    source;
    source_remark;
    ad_id;
}
exports.SubmitLandingQueryDto = SubmitLandingQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the user', example: 'John Doe' }),
    __metadata("design:type", String)
], SubmitLandingQueryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the user',
        example: '+1234567890',
    }),
    __metadata("design:type", String)
], SubmitLandingQueryDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Desired destination',
        example: 'Bali',
    }),
    __metadata("design:type", String)
], SubmitLandingQueryDto.prototype, "destination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the query',
        example: 'australia',
    }),
    __metadata("design:type", String)
], SubmitLandingQueryDto.prototype, "uuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Source of the query',
        example: 'Google Ads',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitLandingQueryDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Remarks about the source',
        example: 'Remark about the ad campaign',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitLandingQueryDto.prototype, "source_remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ad ID associated with the query',
        example: 'AD123456',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitLandingQueryDto.prototype, "ad_id", void 0);
class ContactFormDto {
    name;
    email;
    subject;
    phone;
    message;
    company;
}
exports.ContactFormDto = ContactFormDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the person submitting the form',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], ContactFormDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the person',
        example: 'john.doe@example.com',
    }),
    __metadata("design:type", String)
], ContactFormDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subject of the inquiry',
        example: 'Inquiry about services',
    }),
    __metadata("design:type", String)
], ContactFormDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the person',
        example: '+91-6287639867',
    }),
    __metadata("design:type", String)
], ContactFormDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message content',
        example: 'Hello, I would like to know more about your offerings. Please get back to me. Thanks!',
    }),
    __metadata("design:type", String)
], ContactFormDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ContactFormDto.prototype, "company", void 0);
class UserSkill {
    skill;
    created_at;
}
exports.UserSkill = UserSkill;
class AddCandidateDto {
    phoneNumber;
    email;
    linkedinUrl;
    currentJobTitle;
    jobType;
    resume;
}
exports.AddCandidateDto = AddCandidateDto;
class AddEmployerDto {
    phoneNumber;
    email;
    linkedinUrl;
    currentJobTitle;
    jobType;
    resume;
}
exports.AddEmployerDto = AddEmployerDto;
class AddProspectDto {
    companyName;
    fullName;
    email;
    phoneNumber;
    roleToFill;
    jobType;
    message;
}
exports.AddProspectDto = AddProspectDto;
//# sourceMappingURL=common.dto.js.map