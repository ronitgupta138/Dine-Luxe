interface OTPData {
    name: string;
    otp: string;
    expiryMinutes: number;
}
export declare function otpTemplate(data: OTPData): {
    subject: string;
    html: string;
};
export {};
//# sourceMappingURL=otp-verify.d.ts.map