const Category = require('../models/Category');

class CategoryService {
  // Lấy tất cả danh mục
  async getCategories(includeInactive = false) {
    try {
      const query = includeInactive ? {} : { isActive: true };

      const categories = await Category.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();

      return categories;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh mục theo ID
  async getCategoryById(id) {
    try {
      const category = await Category.findById(id).lean();

      if (!category || !category.isActive) {
        throw new Error('Danh mục không tồn tại');
      }

      return category;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh mục theo slug
  async getCategoryBySlug(slug) {
    try {
      const category = await Category.findOne({ slug, isActive: true }).lean();

      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      return category;
    } catch (error) {
      throw error;
    }
  }

  // Tạo danh mục mới (admin)
  async createCategory(categoryData) {
    try {
      const { name, description, image, sortOrder } = categoryData;

      // Kiểm tra tên đã tồn tại
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        throw new Error('Tên danh mục đã tồn tại');
      }

      const category = new Category({
        name,
        description,
        image,
        sortOrder: sortOrder || 0
      });

      await category.save();
      return category;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật danh mục (admin)
  async updateCategory(id, updateData) {
    try {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      const { name } = updateData;

      // Kiểm tra tên mới có bị trùng không
      if (name && name !== category.name) {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
          throw new Error('Tên danh mục đã tồn tại');
        }
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          category[key] = updateData[key];
        }
      });

      await category.save();
      return category;
    } catch (error) {
      throw error;
    }
  }

  // Xóa danh mục (admin)
  async deleteCategory(id) {
    try {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      // Kiểm tra có sản phẩm nào sử dụng danh mục này không
      const Product = require('../models/Product');
      const productCount = await Product.countDocuments({ category: id });

      if (productCount > 0) {
        throw new Error('Không thể xóa danh mục đang có sản phẩm');
      }

      await Category.findByIdAndDelete(id);
      return { message: 'Danh mục đã được xóa thành công' };
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh mục với số lượng sản phẩm
  async getCategoriesWithProductCount() {
    try {
      const categories = await Category.find({ isActive: true })
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();

      // Thêm productCount cho mỗi category
      const Product = require('../models/Product');
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category._id,
            isActive: true
          });
          return {
            ...category,
            productCount
          };
        })
      );

      return categoriesWithCount;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CategoryService();
