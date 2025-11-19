const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải lớn hơn 0']
  },
  image: {
    type: String
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isGuest;
    }
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  guestInfo: {
    name: String,
    email: String,
    phone: String
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền không được âm']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'momo', 'zalopay'],
    default: 'bank_transfer'
  },
  paymentInfo: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    transactionId: String,
    paymentDate: Date,
    notes: String
  },
  shippingAddress: {
    name: {
      type: String,
      required: [true, 'Tên người nhận là bắt buộc']
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc']
    },
    address: {
      type: String,
      required: [true, 'Địa chỉ giao hàng là bắt buộc']
    },
    city: String,
    district: String,
    ward: String
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
  },
  trackingNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index cho tìm kiếm và lọc
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'guestInfo.email': 1 });

// Virtual field cho tổng số lượng sản phẩm
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual field cho trạng thái hiển thị
orderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Chờ xác nhận',
    paid: 'Đã thanh toán',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  };
  return statusMap[this.status] || this.status;
});

module.exports = mongoose.model('Order', orderSchema);
