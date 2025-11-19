const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên sản phẩm từ 1-100 ký tự'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Mô tả từ 1-1000 ký tự'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số dương'),
  body('category')
    .isMongoId()
    .withMessage('ID danh mục không hợp lệ'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng tồn kho phải là số nguyên không âm')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên sản phẩm từ 1-100 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Mô tả từ 1-1000 ký tự'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số dương'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('ID danh mục không hợp lệ'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng tồn kho phải là số nguyên không âm')
];

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/related', productController.getRelatedProducts);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);

// Admin routes
router.post('/', authenticate, requireAdmin, createProductValidation, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, updateProductValidation, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;
