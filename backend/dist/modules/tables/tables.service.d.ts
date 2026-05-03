import { CreateTableInput, UpdateStatusInput, MergeInput } from './tables.schema';
export declare function getTablesByBranch(branchId: string): Promise<any[]>;
export declare function createTable(input: CreateTableInput): Promise<any>;
export declare function updateTableStatus(tableId: string, input: UpdateStatusInput, actorId: string): Promise<any>;
export declare function mergeTables(input: MergeInput, actorId: string): Promise<any>;
export declare function deleteTable(tableId: string): Promise<{
    deleted: boolean;
}>;
//# sourceMappingURL=tables.service.d.ts.map