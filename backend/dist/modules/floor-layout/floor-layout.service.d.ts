interface TableInLayout {
    label: string;
    x: number;
    y: number;
    capacity: number;
    shape: 'round' | 'square' | 'rectangle' | 'booth';
    zone: string;
    photo_url?: string;
    floor_number: number;
}
interface FloorData {
    floor_number: number;
    tables: TableInLayout[];
}
interface LayoutInput {
    floors: FloorData[];
    layout_version?: number;
}
export declare function saveDraft(branchId: string, input: LayoutInput, userId: string): Promise<any>;
export declare function publishLayout(branchId: string, layoutVersion: number): Promise<any>;
export declare function getLayout(branchId: string): Promise<any>;
export declare function getLiveLayout(branchId: string): Promise<any>;
export {};
//# sourceMappingURL=floor-layout.service.d.ts.map