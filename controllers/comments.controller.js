const CommentDto = require('../dtos/comments.dto');
const AppResponseDto = require('../dtos/app_response.dto');
const Comment = require('../models/comment.model');
exports.getByArticleSlugNotUsed = function (req, res, next) {
    Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
        return req.article.populate({
            path: 'comments',
            populate: {
                path: 'user'
            },
            options: {
                sort: {
                    createdAt: 'desc'
                }
            }
        }).execPopulate().then(function (article) {
            return res.json({
                comments: req.article.comments.map(function (comment) {
                    return comment.toJSONFor(user);
                })
            });
        })
    }).catch(next);
};

exports.getByArticleSlug = function (req, res, next) {

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    return Promise.all([
        Comment.find({article: req.article})
            .limit(Number(pageSize))
            .skip(Number((page - 1) * pageSize))
            .sort({createdAt: 'desc'})
            .populate('user', 'username')
            .populate('article', 'slug')
            .exec(),
        Comment.count({article: req.article}).exec(),
    ]).then(function (results) {
        const comments = results[0];
        const commentsCount = results[1];

        return res.json(CommentDto.buildPagedList(comments, page, pageSize, commentsCount, '/api/comments'));
    }).catch(next);
};
// create a new comment
exports.createComment = function (req, res, next) {
    const commentObj = {};
    if (req.body.content) {
        commentObj.content = req.body.content;
    }

    const comment = new Comment(commentObj);
    comment.article = req.article;
    comment.user = req.user;

    return comment.save().then(comment => {
        res.json(CommentDto.buildDetails(comment));
    }).catch(next);
};

exports.deleteComment = function (req, res, next) {
    // req.article.comments.remove(req.comment._id);
    // req.article.save().then(Comment.find({_id: req.comment._id}).remove().exec())
    //         .then(function () {
    //             res.sendStatus(204);
    //         });

    // 5c2f5be7e18a7c4a20ccd818
    req.comment.delete().then(result => {
        return res.json(AppResponseDto.buildSuccessWithMessages('comment removed successfully'));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + err));
    });
};

exports.getCommentDetails = function (req, res, next) {
    Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
        return req.article.populate({
            path: 'comments',
            populate: {
                path: 'user'
            },
            options: {
                sort: {
                    created_at: 'desc'
                }
            }
        }).execPopulate().then(function (article) {
            return res.json({
                comments: req.article.comments.map(function (comment) {
                    return comment.toJson(user);
                })
            });
        });
    }).catch(next);
};


exports.delete = function (req, res, next) {
    if (req.comment.user.toString() === req.payload.id.toString()) {
        // There is no CASCADE on mongo, so delete manually the entries from both sides
        // Delte from articles.comments
        req.article.comments.remove(req.comment._id);
        req.article.save()
            .then(Comment.find({ // Then Remove from Comments collection
                _id: req.comment._id
            }).remove().exec())
            .then(function () {
                return res.json({
                    success: true, full_messages: ['Deleted comment successfully']
                });
            }).catch(err => {
        });
    } else {
        return res.json({
            success: false, full_messages: ['You don not own this comment']
        }, 403);
    }
};

exports.updateComment = (req, res, next) => {
    return res.json({message: 'not implemented'});
};