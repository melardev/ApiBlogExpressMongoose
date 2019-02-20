const AppResponseDto = require('../dtos/app_response.dto');
const ArticlesDto = require('../dtos/articles.dto');
const Article = require('../models/article.model');

exports.myLikes = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    Article.find(
        {_id: {"$in": [req.user.likes]}}).limit(Number(pageSize))
        .skip(Number((page - 1) * pageSize))
        .sort({createdAt: 'desc'})
        .populate('user', 'username')
        .populate('tags', 'name')
        .populate('categories', 'name')
        .exec().then(articles => {
        return res.json(ArticlesDto.buildPagedList(articles, page, pageSize, req.user.likes.length, ''));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('error' + err));
    });
};

exports.likeArticle = function (req, res, next) {
    if (req.user.isLiking(req.article._id.toString())) {
        return res.json(AppResponseDto.buildWithErrorMessages('You already liked this article'));
    }
    Promise.all([
        req.user.like(req.article.id),
        req.article.increaseLikesByOne()
    ]).then(result => {
        return res.json(AppResponseDto.buildSuccessWithMessages(`Article ${req.article.id} liked successfully`));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('error' + err));
    });
};

// Unlike
exports.unlikeArticle = function (req, res, next) {
    if (!req.user.isLiking(req.article._id.toString()))
        return res.json(AppResponseDto.buildWithErrorMessages('You can not unlike something you did not like before'));

    return req.user.dislike(req.article.id).then(function () {
        return res.json(AppResponseDto.buildSuccessWithMessages('Like deleted successfully'));
    });
};