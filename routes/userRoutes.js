const router = require('express').Router();

const {authenticateUser, authorizePermissions} = require('../middlewares/authentication');
const {updateUser, updatePassword, deleteUser, getAllUsers, getSingleUser, showUser} = require('../controllers/userController');

router.patch('/updateUser', authenticateUser, updateUser);
router.patch('/updatePassword', authenticateUser, updatePassword);
router.delete('/deleteUser', authenticateUser, deleteUser);
router.get('/', authenticateUser, authorizePermissions("admin"), getAllUsers);
router.get('/singleUser/:userId', authenticateUser, getSingleUser);
router.get('/showUser', authenticateUser, showUser)

module.exports = router;