interface SendEmailParams {
    to: string;
    templateName: string;
    data: Record<string, any>;
    replyTo?: string;
}
export declare function sendEmail(params: SendEmailParams): Promise<void>;
export {};
//# sourceMappingURL=send.d.ts.map