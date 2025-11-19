const { validationResult } = require('express-validator');
const orderService = require('../services/orderService');

class OrderController {
  // Tạo đơn hàng mới
  async createOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const orderData = req.body;
      const order = await orderService.createOrder(orderData, req.user);

      res.status(201).json({
        success: true,
        message: 'Tạo đơn hàng thành công',
        data: order
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi tạo đơn hàng'
      });
    }
  }

  // Lấy danh sách đơn hàng (admin)
  async getOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentMethod,
        dateFrom,
        dateTo
      } = req.query;

      const filters = {
        status,
        paymentMethod,
        dateFrom,
        dateTo
      };

      const result = await orderService.getOrders(filters, page, limit);

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy danh sách đơn hàng'
      });
    }
  }

  // Lấy đơn hàng theo ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id, req.user);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Get order by ID error:', error);
      const statusCode = error.message === 'Đơn hàng không tồn tại' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi lấy thông tin đơn hàng'
      });
    }
  }

  // Lấy đơn hàng của user hiện tại
  async getUserOrders(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await orderService.getUserOrders(req.user.id, page, limit);

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy danh sách đơn hàng'
      });
    }
  }

  // Cập nhật trạng thái đơn hàng (admin)
  async updateOrderStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { status, paymentInfo } = req.body;

      const order = await orderService.updateOrderStatus(id, status, paymentInfo);

      res.json({
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      const statusCode = error.message === 'Đơn hàng không tồn tại' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi cập nhật trạng thái đơn hàng'
      });
    }
  }

  // Hủy đơn hàng
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await orderService.cancelOrder(id, req.user, reason);

      res.json({
        success: true,
        message: 'Hủy đơn hàng thành công',
        data: order
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      const statusCode = error.message === 'Đơn hàng không tồn tại' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi hủy đơn hàng'
      });
    }
  }

  // Thống kê đơn hàng (admin)
  async getOrderStats(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;
      const stats = await orderService.getOrderStats(dateFrom, dateTo);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy thống kê đơn hàng'
      });
    }
  }
}

module.exports = new OrderController();
