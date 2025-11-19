const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
  body('items.*.product')
    .isMongoId()
    .withMessage('ID sản phẩm không hợp lệ'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương'),
  body('shippingAddress.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên người nhận từ 1-100 ký tự'),
  body('shippingAddress.phone')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Số điện thoại từ 10-15 ký tự'),
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Địa chỉ giao hàng từ 1-200 ký tự'),
  body('paymentMethod')
    .optional()
    .isIn(['bank_transfer', 'momo', 'zalopay'])
    .withMessage('Phương thức thanh toán không hợp lệ')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Trạng thái đơn hàng không hợp lệ')
];

// Public route (có thể không cần đăng nhập)
router.post('/', optionalAuth, createOrderValidation, orderController.createOrder);

// User routes (cần đăng nhập)
router.get('/user/:id', authenticate, orderController.getUserOrders);

// Admin routes
router.get('/', authenticate, requireAdmin, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatusValidation, orderController.updateOrderStatus);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

// Stats route (admin)
router.get('/stats/overview', authenticate, requireAdmin, orderController.getOrderStats);

module.exports = router;
