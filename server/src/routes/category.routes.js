const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { categoryValidator } = require('../validators/categoryValidator');

module.exports = (categoryController) => {
  router.get('/', categoryController.getAll);
  router.get('/:id', categoryController.getById);

  // Protected routes for staff
  router.use(protect);
  router.use(authorize('librarian', 'admin'));

  router.post('/', categoryValidator, validate, categoryController.create);
  router.put('/:id', categoryValidator, validate, categoryController.update);
  router.delete('/:id', categoryController.delete);

  return router;
};
