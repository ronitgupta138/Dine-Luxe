import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    owner: z.ZodObject<{
        first_name: z.ZodString;
        last_name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        dob: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        phone: string;
        password: string;
        first_name: string;
        last_name: string;
        dob: string;
    }, {
        email: string;
        phone: string;
        password: string;
        first_name: string;
        last_name: string;
        dob: string;
    }>;
    restaurant: z.ZodObject<{
        name: z.ZodString;
        cuisine_types: z.ZodArray<z.ZodString, "many">;
        description: z.ZodOptional<z.ZodString>;
        gst_number: z.ZodOptional<z.ZodString>;
        contact_email: z.ZodOptional<z.ZodString>;
        contact_phone: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        cuisine_types: string[];
        description?: string | undefined;
        gst_number?: string | undefined;
        contact_email?: string | undefined;
        contact_phone?: string | undefined;
        website?: string | undefined;
    }, {
        name: string;
        cuisine_types: string[];
        description?: string | undefined;
        gst_number?: string | undefined;
        contact_email?: string | undefined;
        contact_phone?: string | undefined;
        website?: string | undefined;
    }>;
    branch: z.ZodObject<{
        name: z.ZodString;
        address_line1: z.ZodString;
        address_line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        pincode: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        seating_capacity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        city: string;
        address_line1: string;
        state: string;
        pincode: string;
        seating_capacity: number;
        phone?: string | undefined;
        address_line2?: string | undefined;
    }, {
        name: string;
        city: string;
        address_line1: string;
        state: string;
        pincode: string;
        seating_capacity: number;
        phone?: string | undefined;
        address_line2?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    restaurant: {
        name: string;
        cuisine_types: string[];
        description?: string | undefined;
        gst_number?: string | undefined;
        contact_email?: string | undefined;
        contact_phone?: string | undefined;
        website?: string | undefined;
    };
    branch: {
        name: string;
        city: string;
        address_line1: string;
        state: string;
        pincode: string;
        seating_capacity: number;
        phone?: string | undefined;
        address_line2?: string | undefined;
    };
    owner: {
        email: string;
        phone: string;
        password: string;
        first_name: string;
        last_name: string;
        dob: string;
    };
}, {
    restaurant: {
        name: string;
        cuisine_types: string[];
        description?: string | undefined;
        gst_number?: string | undefined;
        contact_email?: string | undefined;
        contact_phone?: string | undefined;
        website?: string | undefined;
    };
    branch: {
        name: string;
        city: string;
        address_line1: string;
        state: string;
        pincode: string;
        seating_capacity: number;
        phone?: string | undefined;
        address_line2?: string | undefined;
    };
    owner: {
        email: string;
        phone: string;
        password: string;
        first_name: string;
        last_name: string;
        dob: string;
    };
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const updateRestaurantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    cuisine_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodOptional<z.ZodString>;
    gst_number: z.ZodOptional<z.ZodString>;
    contact_email: z.ZodOptional<z.ZodString>;
    contact_phone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    cuisine_types?: string[] | undefined;
    gst_number?: string | undefined;
    contact_email?: string | undefined;
    contact_phone?: string | undefined;
    website?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    cuisine_types?: string[] | undefined;
    gst_number?: string | undefined;
    contact_email?: string | undefined;
    contact_phone?: string | undefined;
    website?: string | undefined;
}>;
export declare const updateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "active", "suspended", "closed"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "closed" | "pending" | "suspended";
    reason?: string | undefined;
}, {
    status: "active" | "closed" | "pending" | "suspended";
    reason?: string | undefined;
}>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
//# sourceMappingURL=restaurants.schema.d.ts.map