interface TablePosition {
    table_id: string;
    x: number;
    y: number;
    rotation?: number;
}
interface LayoutInput {
    layout: {
        canvas_width?: number;
        canvas_height?: number;
        tables: TablePosition[];
        walls?: unknown[];
        decorations?: unknown[];
    };
}
export declare function saveDraft(branchId: string, input: LayoutInput, userId: string): Promise<any>;
export declare function publishLayout(branchId: string, layoutVersion: number | null): Promise<any>;
export declare function getLayout(branchId: string): Promise<any>;
export declare function getLiveLayout(branchId: string): Promise<any>;
export {};
//# sourceMappingURL=floor-layout.service.d.ts.map