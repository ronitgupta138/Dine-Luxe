import { UpdateBrandingInput, UploadUrlInput } from './branding.schema';
export declare function getBranding(restaurantId: string): Promise<any>;
export declare function updateBranding(restaurantId: string, input: UpdateBrandingInput): Promise<any>;
export declare function getUploadUrl(restaurantId: string, input: UploadUrlInput): Promise<{
    upload_url: string;
    public_url: string;
    expires_in: number;
    max_size_bytes: number;
}>;
//# sourceMappingURL=branding.service.d.ts.map