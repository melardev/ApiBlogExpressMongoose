const express = require('express');
const router = express.Router();

const tagCategoriesController = require('../controllers/tags_categories.controller');
router.get('/categories', tagCategoriesController.getTags);
router.get('/tags', tagCategoriesController.getCategories);

module.exports = router;