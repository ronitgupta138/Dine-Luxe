const express = require('express');
const RedisLockService = require('./services/redisLock');
const ReservationController = require('./controllers/reservationController');
const MenuController = require('./controllers/menuController');
const OrderController = require('./controllers/orderController');
const { validateReservation } = require('./middleware/validate');

function createApp(redisClient = null) {
  const app = express();
  app.use(express.json());

  const lockService = new RedisLockService(redisClient);
  const reservationController = new ReservationController(lockService);
  const menuController = new MenuController();
  const orderController = new OrderController();

  // Health
  app.get('/api/health', (req, res) => res.json({ status: 'UP', service: 'DineLuxe-API' }));

  // Menu routes
  app.get('/api/menu', (req, res) => menuController.listMenuItems(req, res));
  app.get('/api/menu/:id', (req, res) => menuController.getMenuItemById(req, res));

  // Reservation routes
  app.post('/api/reservations', validateReservation, (req, res) => reservationController.createReservation(req, res));
  app.get('/api/reservations', (req, res) => reservationController.listReservations(req, res));
  app.get('/api/reservations/:id', (req, res) => reservationController.getReservationById(req, res));
  app.delete('/api/reservations/:id', (req, res) => reservationController.cancelReservation(req, res));

  // Kitchen Display & Order routes
  app.post('/api/orders', (req, res) => orderController.createOrder(req, res));
  app.get('/api/orders/table/:tableId', (req, res) => orderController.getOrdersByTable(req, res));
  app.patch('/api/orders/:id/status', (req, res) => orderController.updateOrderStatus(req, res));

  return app;
}

module.exports = createApp;
