const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên danh mục từ 1-50 ký tự')
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên danh mục từ 1-50 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Mô tả không được vượt quá 200 ký tự')
];

// Public routes
router.get('/', categoryController.getCategories);
router.get('/with-count', categoryController.getCategoriesWithProductCount);
router.get('/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.post('/', authenticate, requireAdmin, createCategoryValidation, categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategoryValidation, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;
