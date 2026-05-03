interface OrderItem {
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
    addons?: string[];
}
interface OrderReceiptData {
    customerName: string;
    restaurantName: string;
    restaurantLogo?: string;
    items: OrderItem[];
    subtotal: number;
    gst: number;
    serviceCharge: number;
    total: number;
    paymentMethod: string;
    orderId: string;
    date: string;
}
export declare function orderReceiptTemplate(data: OrderReceiptData): {
    subject: string;
    html: string;
};
export {};
//# sourceMappingURL=order-receipt.d.ts.map