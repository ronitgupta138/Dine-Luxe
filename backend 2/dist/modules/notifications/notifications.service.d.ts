export declare function sendPush(userId: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
export declare function sendEmailNotification(userId: string, templateName: string, templateData: Record<string, unknown>): Promise<void>;
export declare function createInApp(userId: string, type: string, title: string, body: string, referenceId?: string, referenceType?: string): Promise<void>;
export declare function getForUser(userId: string, page: number, limit: number): Promise<{
    data: any[];
    count: number | null;
}>;
export declare function markRead(id: string, userId: string): Promise<any>;
export declare function markAllRead(userId: string): Promise<void>;
export declare function registerDevice(userId: string, token: string, platform?: string): Promise<any>;
export declare function removeDevice(userId: string, token: string): Promise<void>;
//# sourceMappingURL=notifications.service.d.ts.map