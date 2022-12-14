const {createOrder, getCurrentUserOrder, getAllOrders, getSingleOrder, updateOrder, getMonthlyIncome} = require('../controllers/order')
const router = require('express').Router();
const {authenticateUser, authorizePermissions} = require('../middlewares/authentication');

router.post('/', authenticateUser, createOrder);
router.get('/user/', authenticateUser, getCurrentUserOrder);
router.get('/', [authenticateUser, authorizePermissions('admin')], getAllOrders);
router.get('/:id', authenticateUser, getSingleOrder);
router.patch('/:id', authenticateUser, updateOrder),
router.get('/order/income', [authenticateUser, authorizePermissions('admin')], getMonthlyIncome);

module.exports = router;