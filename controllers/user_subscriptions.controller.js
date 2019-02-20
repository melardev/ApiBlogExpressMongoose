const AppResponseDto = require("../dtos/app_response.dto");

const UserSubscriptionsDto = require('../dtos/user_subscriptions.dto');
const Tag = require('../models/tag.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');


exports.index = function (req, res, next) {

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    return Promise.all([
        User.findOne({
            _id: req.user.id,
        })
            .populate('following', ['_id', 'first_name', 'username'])
            .populate('followers', ['first_name', 'username'])
            .exec(),
    ]).then(function (results) {
        const user = results[0];
        const id = req.user.id;
        return res.json(UserSubscriptionsDto.buildPagedList(user.following, user.followers, page, pageSize,
            user.following.length + user.followers.length
            , '/api/articles'));
    }).catch(next);
};


exports.followUser = async function (req, res, next) {

    if (!req.requested_user.isAuthor()) {
        return res.json({
            success: false, full_messages: ['You can not follow an non author user']
        });
    }
    req.user.follow(req.requested_user)
        .then(result => {
            return res.json(AppResponseDto.buildSuccessWithMessages(`You are just subscribed to ${req.requested_user.username}`))
        }).catch(err => {
        res.status(400).json({
            success: false, full_messages: [err.toString()]
        })
    });
};

exports.unfollowUser = async function (req, res, next) {

    req.user.unfollow(req.requested_user)
        .then(result => {
            return res.json(AppResponseDto.buildSuccessWithMessages(`You have just unsubscribed from ${req.requested_user.username}`))
        }).catch(err => {
        res.status(400).json({
            success: false, full_messages: [err.toString()]
        })
    });
};

exports.updateArticle = function (req, res, next) {

    if (req.body.title !== null) {
        req.article.title = req.body.title;
    }

    if (req.body.description !== null)
        req.article.description = req.body.description;

    const promises = [];
    if (req.body.tags && req.body.tags instanceof Array) {
        req.body.tags.forEach(t => {
            promises.push(Tag.findOneOrCreateWith({name: t.name}, {name: t.name, description: t.description})
            );
        });
    }

    if (req.body.categories && req.body.categories instanceof Array) {
        req.body.categories.forEach(c => {
            promises.push(Category.findOneOrCreateWith({name: c.name}, {
                name: c.name,
                description: c.description
            }))
        });
    }

    Promise.all(promises)
        .then(result => {
            // result[0].isNew
            const tags = [];
            const categories = [];

            result.forEach(r => {
                if (r.collection.name === 'tags')
                    tags.push(r);
                else if (r.collection.name === 'categories')
                    categories.push(r);
            });

            req.article.tags = tags;
            req.article.categories = categories;

            return req.article.save().then(function (article) {
                return res.json(AppResponseDto.buildDetails(article, req.user))
            }).catch(err => {
                res.status(500).json(AppResponseDto.buildWithErrorMessages('error: ' + err))
            });
        }).catch(err => {
        console.error(err);
        return res.json('Error');

    });
};
exports.updateArticleNotUsed = function (req, res, next) {
    new Promise((resolve, reject) => {
        User.findById(req.payload.id)
            .then(user => user !== null ? resolve(user) : reject('user not found'))
            .catch(err => reject('unknown error' + err));
    }).then(user => {
        if (user._id.toString() === req.article.user._id.toString()) {

            if (req.body.title !== null) {
                req.article.title = req.article.title;
            }

            if (req.body.description !== null)
                req.article.description = req.body.description;

            if (req.body.tags !== null)
                req.article.tags = req.body.tags;

            if (req.body.categories !== null)
                req.article.categories = req.body.categories;

            req.article.save().then(function (article) {
                return res.json({
                    success: true, article: article.toJson(user)
                });
            }).catch(next);
        } else {
            return res.json({
                success: false, errors: {
                    full_messages: ['Permission denied']
                }
            }, 403);
        }
    }).catch(err => {
        throw err;
    });
};

exports.deleteArticle = function (req, res, next) {
    User.findById(req.payload.id).then(function (suser) {
        if (!user)
            return res.sendStatus(401);

        if (req.article.user._id.toString() === req.payload.id.toString()) {
            return req.article.remove().then(function () {
                return res.sendStatus(204);
            });
        } else {
            return res.sendStatus(403);
        }

    }).catch(next);
};
exports.deleteArticle = function (req, res, next) {
    // Todo: if the previous promise pattern works, replace it by this copy paste
    User.findById(req.user.id).then(function (user) {
        if (!user)
            return res.json({success: false, errors: {full_messages: ['Permission Denied, should authenticate']}}, 401);

        // If user owns the article he tries to delete
        if (req.article.user._id.toString() === req.user.id.toString()) {
            return req.article.remove().then(function () {
                return res.json({
                    success: true, full_messages: ['Article deleted successfully']
                });
            });
        } else {
            return json.render({
                success: false, full_messages: ['Permission denied']
            });
        }
    }).catch(err => {
        throw err;
    });
};