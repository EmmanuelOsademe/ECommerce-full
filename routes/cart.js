const {createCart, updateCart, getAllCarts, getCart, deleteCart} = require('../controllers/cart');
const {authenticateUser, authorizePermissions} = require('../middlewares/authentication')

const router = require('express').Router();

router.post('/', authenticateUser, createCart);
router.get('/', [authenticateUser, authorizePermissions('admin'), getAllCarts]);
router.get('/:id', authenticateUser, getCart);
router.patch('/:id', authenticateUser, updateCart);
router.delete('/:id', authenticateUser, deleteCart);

module.exports = router;