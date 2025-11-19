const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  // Tạo JWT token
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  // Đăng ký user mới
  async register(userData) {
    try {
      const { name, email, password, phone, address } = userData;

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }

      // Tạo user mới
      const user = new User({
        name,
        email,
        password,
        phone,
        address
      });

      await user.save();

      // Tạo token
      const token = this.generateToken(user._id);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Đăng nhập
  async login(email, password) {
    try {
      // Tìm user theo email và include password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      if (!user.isActive) {
        throw new Error('Tài khoản đã bị khóa');
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Tạo token
      const token = this.generateToken(user._id);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User không tồn tại');
      }

      if (!user.isActive) {
        throw new Error('Tài khoản đã bị khóa');
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw error;
    }
  }

  // Tạo admin mặc định (chỉ dùng trong setup)
  async createDefaultAdmin() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@mmo-store.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      const existingAdmin = await User.findOne({ email: adminEmail });
      if (existingAdmin) {
        return;
      }

      const admin = new User({
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('Admin mặc định đã được tạo:', adminEmail);
    } catch (error) {
      console.error('Lỗi tạo admin mặc định:', error.message);
    }
  }
}

module.exports = new AuthService();
