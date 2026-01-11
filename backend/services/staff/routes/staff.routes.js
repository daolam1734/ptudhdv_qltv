const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../../shared/middleware/authMiddleware');

module.exports = (staffController) => {
  // All staff routes require admin authentication
  router.use(authMiddleware);
  router.use(authorize('admin'));

  router.get('/', staffController.getAllStaff);
  router.post('/', staffController.createStaff);
  router.get('/:id', staffController.getStaffById);
  router.put('/:id', staffController.updateStaff);
  router.delete('/:id', staffController.deleteStaff);

  return router;
};
