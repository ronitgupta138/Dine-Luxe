import { z } from 'zod';
export declare const registerDeviceSchema: z.ZodObject<{
    body: z.ZodObject<{
        token: z.ZodString;
        platform: z.ZodOptional<z.ZodEnum<["ios", "android", "web"]>>;
    }, "strip", z.ZodTypeAny, {
        token: string;
        platform?: "ios" | "android" | "web" | undefined;
    }, {
        token: string;
        platform?: "ios" | "android" | "web" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        token: string;
        platform?: "ios" | "android" | "web" | undefined;
    };
}, {
    body: {
        token: string;
        platform?: "ios" | "android" | "web" | undefined;
    };
}>;
//# sourceMappingURL=notifications.schema.d.ts.map