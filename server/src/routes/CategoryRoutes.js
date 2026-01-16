const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Protected routes for staff
router.use(protect);
router.use(authorize('staff', 'admin'));

router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;
