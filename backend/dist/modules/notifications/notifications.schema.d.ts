import { z } from 'zod';
export declare const registerDeviceSchema: z.ZodObject<{
    body: z.ZodObject<{
        token: z.ZodString;
        platform: z.ZodOptional<z.ZodEnum<["ios", "android", "web"]>>;
    }, "strip", z.ZodTypeAny, {
        token?: string;
        platform?: "ios" | "android" | "web";
    }, {
        token?: string;
        platform?: "ios" | "android" | "web";
    }>;
}, "strip", z.ZodTypeAny, {
    body?: {
        token?: string;
        platform?: "ios" | "android" | "web";
    };
}, {
    body?: {
        token?: string;
        platform?: "ios" | "android" | "web";
    };
}>;
//# sourceMappingURL=notifications.schema.d.ts.map