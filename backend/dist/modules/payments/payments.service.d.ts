/**
 * Payments Service
 *
 * TODO markers indicate where real payment gateway integration goes.
 * Currently implements stub logic for development & testing.
 *
 * Gateway candidates: Razorpay (recommended for INR), Stripe (international)
 */
import type { InitiateInput, VerifyInput, SplitInput, UPIQRInput } from './payments.schema';
export declare function initiatePayment(input: InitiateInput, branchId: string, restaurantId: string): Promise<{
    payment_id: any;
    amount: any;
    status: string;
    gateway_order_id: null;
}>;
export declare function verifyPayment(input: VerifyInput, branchId: string): Promise<any>;
export declare function generateUPIQR(input: UPIQRInput, branchId: string): Promise<{
    upi_link: string;
    qr_base64: string;
    amount: number;
    transaction_ref: string;
    upi_id: string;
}>;
export declare function pollUPIStatus(transactionRef: string, branchId: string): Promise<{
    status: string;
    ref: string;
    source: string;
}>;
export declare function splitBill(input: SplitInput, branchId: string, restaurantId: string): Promise<any[]>;
export declare function getReceipt(orderId: string, branchId: string): Promise<{
    receipt_type: string;
    order_id: string;
    computed_total: number;
    data: any;
    payments: {
        id: any;
        amount: any;
        method: any;
        status: any;
        transaction_ref: any;
        gateway_payment_id: any;
        created_at: any;
    }[];
}>;
export declare function onPaymentComplete(orderId: string, branchId: string, restaurantId: string): Promise<void>;
export declare function handleGatewayWebhook(body: Record<string, unknown>): Promise<{
    received: boolean;
}>;
//# sourceMappingURL=payments.service.d.ts.map