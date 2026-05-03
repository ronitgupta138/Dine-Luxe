interface JoinQueueInput {
    branch_id: string;
    people_count: number;
    customer_name?: string;
    customer_phone?: string;
    user_id?: string;
}
export declare function joinQueue(input: JoinQueueInput): Promise<any>;
export declare function getBranchQueue(branchId: string, query: Record<string, string>): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getQueuePosition(queueId: string): Promise<{
    queue_id: string;
    position: any;
    status: any;
    people_count: any;
    entries_ahead: number;
    free_tables: number;
    estimated_wait_minutes: number;
    avg_turn_time_minutes: number;
}>;
export declare function markQueueArrived(queueId: string): Promise<any>;
export declare function assignTable(queueId: string, tableId: string, hostId: string): Promise<any>;
export declare function markQueueNoShow(queueId: string): Promise<any>;
export declare function removeFromQueue(queueId: string): Promise<{
    removed: boolean;
}>;
export {};
//# sourceMappingURL=queue.service.d.ts.map