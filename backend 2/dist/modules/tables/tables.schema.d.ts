import { z } from 'zod';
export declare const TableStatus: z.ZodEnum<["free", "reserved", "occupied", "cleaning", "maintenance"]>;
export type TableStatusType = z.infer<typeof TableStatus>;
export declare const TableShape: z.ZodEnum<["round", "square", "rectangle", "booth"]>;
export declare const createTableSchema: z.ZodObject<{
    branch_id: z.ZodString;
    label: z.ZodString;
    capacity: z.ZodNumber;
    floor_number: z.ZodDefault<z.ZodNumber>;
    shape: z.ZodDefault<z.ZodEnum<["round", "square", "rectangle", "booth"]>>;
    zone: z.ZodDefault<z.ZodString>;
    photo_url: z.ZodOptional<z.ZodString>;
    x_pos: z.ZodOptional<z.ZodNumber>;
    y_pos: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    branch_id: string;
    shape: "round" | "square" | "rectangle" | "booth";
    capacity: number;
    label: string;
    zone: string;
    floor_number: number;
    photo_url?: string | undefined;
    x_pos?: number | undefined;
    y_pos?: number | undefined;
}, {
    branch_id: string;
    capacity: number;
    label: string;
    shape?: "round" | "square" | "rectangle" | "booth" | undefined;
    zone?: string | undefined;
    photo_url?: string | undefined;
    floor_number?: number | undefined;
    x_pos?: number | undefined;
    y_pos?: number | undefined;
}>;
export declare const updateStatusSchema: z.ZodObject<{
    new_status: z.ZodEnum<["free", "reserved", "occupied", "cleaning", "maintenance"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    new_status: "free" | "occupied" | "cleaning" | "reserved" | "maintenance";
    reason?: string | undefined;
}, {
    new_status: "free" | "occupied" | "cleaning" | "reserved" | "maintenance";
    reason?: string | undefined;
}>;
export declare const mergeSchema: z.ZodEffects<z.ZodObject<{
    table_id_1: z.ZodString;
    table_id_2: z.ZodString;
}, "strip", z.ZodTypeAny, {
    table_id_1: string;
    table_id_2: string;
}, {
    table_id_1: string;
    table_id_2: string;
}>, {
    table_id_1: string;
    table_id_2: string;
}, {
    table_id_1: string;
    table_id_2: string;
}>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type MergeInput = z.infer<typeof mergeSchema>;
export declare const VALID_TRANSITIONS: Record<TableStatusType, TableStatusType[]>;
//# sourceMappingURL=tables.schema.d.ts.map