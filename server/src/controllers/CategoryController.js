const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const categoryService = require('../services/CategoryService');

class CategoryController {
  constructor(categoryService) {
    this.categoryService = categoryService;
  }

  getAll = asyncHandler(async (req, res) => {
    const result = await this.categoryService.getAllCategories(req.query);
    ApiResponse.paginated(res, result.data, result.pagination, 'Categories retrieved successfully');
  });

  getById = asyncHandler(async (req, res) => {
    const category = await this.categoryService.getById(req.params.id);
    if (!category) {
      return ApiResponse.error(res, 'Category not found', 404);
    }
    ApiResponse.success(res, category);
  });

  create = asyncHandler(async (req, res) => {
    const category = await this.categoryService.create(req.body);
    ApiResponse.success(res, category, 'Category created successfully', 201);
  });

  update = asyncHandler(async (req, res) => {
    const category = await this.categoryService.update(req.params.id, req.body);
    if (!category) {
      return ApiResponse.error(res, 'Category not found', 404);
    }
    ApiResponse.success(res, category, 'Category updated successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await this.categoryService.delete(req.params.id);
    ApiResponse.success(res, null, 'Category deleted successfully');
  });
}

module.exports = CategoryController;
