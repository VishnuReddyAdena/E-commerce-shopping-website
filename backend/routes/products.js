import express from 'express';
import {
  getProducts,
  getProductById,
  getProductRecommendations,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getSearchSuggestions,
  getFrequentlyBoughtTogether,
  getPersonalizedRecommendations
} from '../controllers/productController.js';
import { protect, admin, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/user/personalized', optionalProtect, getPersonalizedRecommendations);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getProductRecommendations);
router.get('/:id/frequently-bought', getFrequentlyBoughtTogether);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

export default router;
