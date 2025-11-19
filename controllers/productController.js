const { validationResult } = require('express-validator');
const productService = require('../services/productService');

class ProductController {
  // Lấy danh sách sản phẩm
  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        search,
        minPrice,
        maxPrice,
        tags,
        sort,
        featured
      } = req.query;

      const filters = {
        category,
        search,
        minPrice,
        maxPrice,
        tags: tags ? tags.split(',') : [],
        sort,
        featured
      };

      const result = await productService.getProducts(filters, page, limit);

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy danh sách sản phẩm'
      });
    }
  }

  // Lấy sản phẩm theo ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      const statusCode = error.message === 'Sản phẩm không tồn tại' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi lấy thông tin sản phẩm'
      });
    }
  }

  // Lấy sản phẩm theo slug
  async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;
      const product = await productService.getProductBySlug(slug);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by slug error:', error);
      const statusCode = error.message === 'Sản phẩm không tồn tại' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi lấy thông tin sản phẩm'
      });
    }
  }

  // Tạo sản phẩm mới (admin)
  async createProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const productData = req.body;
      const product = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm thành công',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi tạo sản phẩm'
      });
    }
  }

  // Cập nhật sản phẩm (admin)
  async updateProduct(req, res) {
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
      const updateData = req.body;

      const product = await productService.updateProduct(id, updateData);

      res.json({
        success: true,
        message: 'Cập nhật sản phẩm thành công',
        data: product
      });
    } catch (error) {
      console.error('Update product error:', error);
      const statusCode = error.message === 'Sản phẩm không tồn tại' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi cập nhật sản phẩm'
      });
    }
  }

  // Xóa sản phẩm (admin)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.deleteProduct(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete product error:', error);
      const statusCode = error.message === 'Sản phẩm không tồn tại' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi xóa sản phẩm'
      });
    }
  }

  // Lấy sản phẩm nổi bật
  async getFeaturedProducts(req, res) {
    try {
      const { limit = 8 } = req.query;
      const products = await productService.getFeaturedProducts(limit);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy sản phẩm nổi bật'
      });
    }
  }

  // Lấy sản phẩm liên quan
  async getRelatedProducts(req, res) {
    try {
      const { productId, categoryId, limit = 4 } = req.query;

      if (!productId || !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu productId hoặc categoryId'
        });
      }

      const products = await productService.getRelatedProducts(productId, categoryId, limit);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get related products error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy sản phẩm liên quan'
      });
    }
  }
}

module.exports = new ProductController();
