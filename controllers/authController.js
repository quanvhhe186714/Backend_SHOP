const { validationResult } = require('express-validator');
const authService = require('../services/authService');

class AuthController {
  // Đăng ký
  async register(req, res) {
    try {
      // Kiểm tra validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const { name, email, password, phone, address } = req.body;

      const result = await authService.register({
        name,
        email,
        password,
        phone,
        address
      });

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: result
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Đăng ký thất bại'
      });
    }
  }

  // Đăng nhập
  async login(req, res) {
    try {
      // Kiểm tra validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Đăng nhập thất bại'
      });
    }
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(req, res) {
    try {
      const user = await authService.getCurrentUser(req.user.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi lấy thông tin user'
      });
    }
  }

  // Đăng xuất (client-side chỉ cần xóa token)
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  }

  // Tạo admin mặc định (chỉ dùng trong development)
  async createDefaultAdmin(req, res) {
    try {
      await authService.createDefaultAdmin();
      res.json({
        success: true,
        message: 'Admin mặc định đã được tạo'
      });
    } catch (error) {
      console.error('Create default admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi tạo admin mặc định'
      });
    }
  }
}

module.exports = new AuthController();
