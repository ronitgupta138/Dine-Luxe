const crypto = require('crypto');

class OrderController {
  constructor() {
    this.orders = new Map();
  }

  createOrder(req, res) {
    const { tableId, items, specialInstructions } = req.body;
    if (!tableId) {
      return res.status(400).json({ success: false, error: 'Table ID is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one order item is required' });
    }

    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      tableId: String(tableId),
      items,
      specialInstructions: specialInstructions || '',
      status: 'PLACED',
      createdAt: new Date().toISOString()
    };

    this.orders.set(orderId, order);
    return res.status(201).json({ success: true, message: 'Order submitted to kitchen', data: order });
  }

  getOrdersByTable(req, res) {
    const { tableId } = req.params;
    const tableOrders = Array.from(this.orders.values()).filter(o => o.tableId === String(tableId));
    return res.status(200).json({ success: true, count: tableOrders.length, data: tableOrders });
  }

  updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_TO_SERVE', 'SERVED', 'BILLED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = this.orders.get(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    return res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  }
}

module.exports = OrderController;
