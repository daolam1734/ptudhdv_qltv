const { body } = require('express-validator');

const bookValidator = [
  body('title').trim().notEmpty().withMessage('Tiêu đề sách không được để trống').isLength({ max: 200 }),
  body('isbn').trim().notEmpty().withMessage('Mã ISBN không được để trống').matches(/^(?:\d{10}|\d{13})$/).withMessage('ISBN phải là 10 hoặc 13 số'),
  body('author').trim().notEmpty().withMessage('Tác giả không được để trống'),
  body('publisher').trim().notEmpty().withMessage('Nhà xuất bản không được để trống'),
  body('publishYear').optional({ checkFalsy: true }).isInt({ min: 1800, max: new Date().getFullYear() + 1 }).withMessage('Năm xuất bản không hợp lệ'),
  body('categoryId').notEmpty().withMessage('Thể loại không được để trống').isMongoId().withMessage('ID thể loại không hợp lệ'),
  body('lang').trim().notEmpty().withMessage('Ngôn ngữ không được để trống'),
  body('pages').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Số trang phải lớn hơn 0'),
  body('quantity').notEmpty().withMessage('Số lượng không được để trống').isInt({ min: 0 }).withMessage('Số lượng không thể âm'),
  body('available').optional().isInt({ min: 0 }).withMessage('Số lượng sẵn có không thể âm'),
  body('price').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Giá tiền không thể âm'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage('Mô tả quá dài'),
  body('status').optional().isIn(['available', 'unavailable', 'maintenance', 'discontinued']).withMessage('Trạng thái không hợp lệ')
];

module.exports = {
  bookValidator
};
