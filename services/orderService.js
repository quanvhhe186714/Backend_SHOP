const Order = require('../models/Order');
const Product = require('../models/Product');

class OrderService {
  // Tạo đơn hàng mới
  async createOrder(orderData, user = null) {
    try {
      const { items, shippingAddress, paymentMethod, notes } = orderData;

      // Validate items và tính tổng tiền
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product || !product.isActive) {
          throw new Error(`Sản phẩm ${item.name} không tồn tại hoặc đã ngừng bán`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm`);
        }

        validatedItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images[0] || null
        });

        totalAmount += product.price * item.quantity;
      }

      // Tạo đơn hàng
      const orderDataToSave = {
        items: validatedItems,
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || 'bank_transfer',
        notes
      };

      if (user) {
        orderDataToSave.user = user._id;
      } else {
        // Đơn hàng từ khách vãng lai
        orderDataToSave.isGuest = true;
        orderDataToSave.guestInfo = {
          name: shippingAddress.name,
          email: shippingAddress.email || null,
          phone: shippingAddress.phone
        };
      }

      const order = new Order(orderDataToSave);
      await order.save();

      // Populate thông tin user nếu có
      if (user) {
        await order.populate('user', 'name email phone');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách đơn hàng (admin)
  async getOrders(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};

      // Áp dụng filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.paymentMethod) {
        query.paymentMethod = filters.paymentMethod;
      }

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      // Sort options
      let sortOption = { createdAt: -1 };

      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('user', 'name email phone')
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query)
      ]);

      return {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy đơn hàng theo ID
  async getOrderById(id, user = null) {
    try {
      let query = { _id: id };

      // Nếu là user thường, chỉ xem đơn hàng của mình
      if (user && user.role !== 'admin') {
        query.user = user._id;
      }

      const order = await Order.findOne(query)
        .populate('user', 'name email phone')
        .lean();

      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Lấy đơn hàng của user
  async getUserOrders(userId, page = 1, limit = 10) {
    try {
      const query = { user: userId };
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query)
      ]);

      return {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái đơn hàng (admin)
  async updateOrderStatus(id, status, paymentInfo = null) {
    try {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Trạng thái đơn hàng không hợp lệ');
      }

      order.status = status;

      // Nếu cập nhật thành đã thanh toán, lưu thông tin thanh toán
      if (status === 'paid' && paymentInfo) {
        order.paymentInfo = {
          ...order.paymentInfo,
          ...paymentInfo,
          paymentDate: new Date()
        };
      }

      // Nếu giao hàng thành công, cập nhật tracking
      if (status === 'shipped' && paymentInfo?.trackingNumber) {
        order.trackingNumber = paymentInfo.trackingNumber;
      }

      await order.save();
      await order.populate('user', 'name email phone');

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Hủy đơn hàng
  async cancelOrder(id, user = null, reason = '') {
    try {
      let query = { _id: id };

      // Nếu là user thường, chỉ hủy đơn hàng của mình
      if (user && user.role !== 'admin') {
        query.user = user._id;
      }

      const order = await Order.findOne(query);
      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc paid
      if (!['pending', 'paid'].includes(order.status)) {
        throw new Error('Không thể hủy đơn hàng đã xử lý');
      }

      order.status = 'cancelled';
      if (reason) {
        order.notes = (order.notes || '') + `\nLý do hủy: ${reason}`;
      }

      await order.save();
      await order.populate('user', 'name email phone');

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Thống kê đơn hàng
  async getOrderStats(dateFrom = null, dateTo = null) {
    try {
      const matchStage = {};

      if (dateFrom || dateTo) {
        matchStage.createdAt = {};
        if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
        if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
      }

      const stats = await Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            paidOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        paidOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
