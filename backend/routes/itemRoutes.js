const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  updateItemStock
} = require('../controllers/itemController');

// Routes
router.route('/')
  .get(getAllItems)
  .post(createItem);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

router.route('/:id/stock')
  .patch(updateItemStock);

module.exports = router;
