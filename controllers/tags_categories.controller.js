const Article = require('../models/article.model');
exports.getTags = function (req, res, next) {
    Article.find().distinct('tags').then(tags => {
        return res.json({
            success: true, data: {tags: tags}
        });
    }).catch(next);
};

exports.getCategories = function (req, res, next) {
    Article.find().distinct('categories').then(categories => {
        return res.json({
            success: true, data: {categories: categories}
        });
    }).catch(next);
};