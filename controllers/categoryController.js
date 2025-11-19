const { validationResult } = require('express-validator');
const categoryService = require('../services/categoryService');

class CategoryController {
  // Lấy tất cả danh mục
  async getCategories(req, res) {
    try {
      const { includeInactive = false } = req.query;
      const categories = await categoryService.getCategories(includeInactive === 'true');

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy danh sách danh mục'
      });
    }
  }

  // Lấy danh mục theo ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category by ID error:', error);
      const statusCode = error.message === 'Danh mục không tồn tại' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi lấy thông tin danh mục'
      });
    }
  }

  // Lấy danh mục theo slug
  async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;
      const category = await categoryService.getCategoryBySlug(slug);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category by slug error:', error);
      const statusCode = error.message === 'Danh mục không tồn tại' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi lấy thông tin danh mục'
      });
    }
  }

  // Tạo danh mục mới (admin)
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array()
        });
      }

      const categoryData = req.body;
      const category = await categoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        message: 'Tạo danh mục thành công',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi tạo danh mục'
      });
    }
  }

  // Cập nhật danh mục (admin)
  async updateCategory(req, res) {
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

      const category = await categoryService.updateCategory(id, updateData);

      res.json({
        success: true,
        message: 'Cập nhật danh mục thành công',
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);
      const statusCode = error.message === 'Danh mục không tồn tại' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi cập nhật danh mục'
      });
    }
  }

  // Xóa danh mục (admin)
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.deleteCategory(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete category error:', error);
      const statusCode = error.message.includes('không thể xóa') ? 400 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi xóa danh mục'
      });
    }
  }

  // Lấy danh mục với số lượng sản phẩm
  async getCategoriesWithProductCount(req, res) {
    try {
      const categories = await categoryService.getCategoriesWithProductCount();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories with product count error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy danh sách danh mục'
      });
    }
  }
}

module.exports = new CategoryController();
