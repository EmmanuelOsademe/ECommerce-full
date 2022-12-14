const {authenticateUser, authorizePermissions} = require('../middlewares/authentication');
const {createReview, updateReview, getAllReviews,
    getSingleReview, getProductReview, deleteReview} = require('../controllers/review');

const router = require('express').Router();

router.post('/', authenticateUser, createReview);
router.patch('/:id', authenticateUser, updateReview);
router.get('/', getAllReviews);
router.get('/single/:id', authenticateUser, getSingleReview);
router.get('/product/:id', getProductReview);
router.delete('/:id', authenticateUser, deleteReview);

module.exports = router;