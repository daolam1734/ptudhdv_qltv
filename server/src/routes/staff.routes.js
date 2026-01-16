const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createStaffValidator, updateStaffValidator } = require('../validators/staffValidator');

module.exports = (staffController) => {
  router.use(authMiddleware);
  router.use(authorize('admin'));
  router.get('/', staffController.getAllStaff);
  router.post('/', createStaffValidator, validate, staffController.createStaff);
  router.get('/:id', staffController.getStaffById);
  router.put('/:id', updateStaffValidator, validate, staffController.updateStaff);
  router.delete('/:id', staffController.deleteStaff);
  return router;
};
