const Product = require('../models/Product');
const Category = require('../models/Category');

class ProductService {
  // Lấy danh sách sản phẩm với filter và pagination
  async getProducts(filters = {}, page = 1, limit = 12) {
    try {
      const query = { isActive: true };

      // Áp dụng filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      if (filters.featured !== undefined) {
        query.featured = filters.featured === 'true';
      }

      // Sort options
      let sortOption = { createdAt: -1 };
      if (filters.sort) {
        switch (filters.sort) {
          case 'price_asc':
            sortOption = { price: 1 };
            break;
          case 'price_desc':
            sortOption = { price: -1 };
            break;
          case 'name_asc':
            sortOption = { name: 1 };
            break;
          case 'name_desc':
            sortOption = { name: -1 };
            break;
          case 'newest':
            sortOption = { createdAt: -1 };
            break;
          case 'oldest':
            sortOption = { createdAt: 1 };
            break;
        }
      }

      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('category', 'name slug')
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query)
      ]);

      return {
        products,
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

  // Lấy sản phẩm theo ID
  async getProductById(id) {
    try {
      const product = await Product.findById(id)
        .populate('category', 'name slug description')
        .lean();

      if (!product || !product.isActive) {
        throw new Error('Sản phẩm không tồn tại');
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm theo slug
  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({ slug, isActive: true })
        .populate('category', 'name slug description')
        .lean();

      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Tạo sản phẩm mới (admin)
  async createProduct(productData) {
    try {
      const { name, description, price, category, images, stock, tags, featured } = productData;

      // Kiểm tra category tồn tại
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        throw new Error('Danh mục không tồn tại');
      }

      const product = new Product({
        name,
        description,
        price: parseFloat(price),
        category,
        images: images || [],
        stock: parseInt(stock) || 0,
        tags: tags || [],
        featured: featured || false
      });

      await product.save();
      await product.populate('category', 'name slug');

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật sản phẩm (admin)
  async updateProduct(id, updateData) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }

      const { category, price, stock, tags } = updateData;

      // Kiểm tra category nếu có update
      if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          throw new Error('Danh mục không tồn tại');
        }
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          if (key === 'price') {
            product[key] = parseFloat(updateData[key]);
          } else if (key === 'stock') {
            product[key] = parseInt(updateData[key]);
          } else if (key === 'tags') {
            product[key] = Array.isArray(updateData[key]) ? updateData[key] : [];
          } else {
            product[key] = updateData[key];
          }
        }
      });

      await product.save();
      await product.populate('category', 'name slug');

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Xóa sản phẩm (admin)
  async deleteProduct(id) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }

      await Product.findByIdAndDelete(id);
      return { message: 'Sản phẩm đã được xóa thành công' };
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm nổi bật
  async getFeaturedProducts(limit = 8) {
    try {
      return await Product.find({ isActive: true, featured: true })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm liên quan
  async getRelatedProducts(productId, categoryId, limit = 4) {
    try {
      return await Product.find({
        _id: { $ne: productId },
        category: categoryId,
        isActive: true
      })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();
