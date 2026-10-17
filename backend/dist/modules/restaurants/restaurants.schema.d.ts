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
        email?: string;
        phone?: string;
        password?: string;
        first_name?: string;
        last_name?: string;
        dob?: string;
    }, {
        email?: string;
        phone?: string;
        password?: string;
        first_name?: string;
        last_name?: string;
        dob?: string;
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
        name?: string;
        description?: string;
        cuisine_types?: string[];
        gst_number?: string;
        contact_email?: string;
        contact_phone?: string;
        website?: string;
    }, {
        name?: string;
        description?: string;
        cuisine_types?: string[];
        gst_number?: string;
        contact_email?: string;
        contact_phone?: string;
        website?: string;
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
        name?: string;
        phone?: string;
        city?: string;
        address_line1?: string;
        address_line2?: string;
        state?: string;
        pincode?: string;
        seating_capacity?: number;
    }, {
        name?: string;
        phone?: string;
        city?: string;
        address_line1?: string;
        address_line2?: string;
        state?: string;
        pincode?: string;
        seating_capacity?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    restaurant?: {
        name?: string;
        description?: string;
        cuisine_types?: string[];
        gst_number?: string;
        contact_email?: string;
        contact_phone?: string;
        website?: string;
    };
    branch?: {
        name?: string;
        phone?: string;
        city?: string;
        address_line1?: string;
        address_line2?: string;
        state?: string;
        pincode?: string;
        seating_capacity?: number;
    };
    owner?: {
        email?: string;
        phone?: string;
        password?: string;
        first_name?: string;
        last_name?: string;
        dob?: string;
    };
}, {
    restaurant?: {
        name?: string;
        description?: string;
        cuisine_types?: string[];
        gst_number?: string;
        contact_email?: string;
        contact_phone?: string;
        website?: string;
    };
    branch?: {
        name?: string;
        phone?: string;
        city?: string;
        address_line1?: string;
        address_line2?: string;
        state?: string;
        pincode?: string;
        seating_capacity?: number;
    };
    owner?: {
        email?: string;
        phone?: string;
        password?: string;
        first_name?: string;
        last_name?: string;
        dob?: string;
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
    name?: string;
    description?: string;
    cuisine_types?: string[];
    gst_number?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
}, {
    name?: string;
    description?: string;
    cuisine_types?: string[];
    gst_number?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
}>;
export declare const updateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "active", "suspended", "inactive"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | "pending" | "suspended";
    reason?: string;
}, {
    status?: "active" | "inactive" | "pending" | "suspended";
    reason?: string;
}>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
//# sourceMappingURL=restaurants.schema.d.ts.map