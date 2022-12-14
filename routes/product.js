const {createProduct, getAllProducts, getSingleProduct,
uploadImage, updateImage, updateProduct, deleteProduct} = require('../controllers/productController');
const {upload} = require('../utils');
const {authenticateUser, authorizePermissions} = require('../middlewares/authentication');

const router = require('express').Router();

router.post('/', [authenticateUser, authorizePermissions('admin')], createProduct);
router.get('/', getAllProducts);
router.get('/:id', getSingleProduct);
router.patch('/:id', [authenticateUser, authorizePermissions('admin')], updateProduct)
router.delete('/:id', [authenticateUser, authorizePermissions('admin')], deleteProduct);
router.post('/uploadImage/:id', [authenticateUser, authorizePermissions('admin')], uploadImage);
router.post('/updateImage', [authenticateUser, authorizePermissions('admin')], updateImage)

module.exports = router;