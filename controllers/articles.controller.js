//
const ArticleListDto = require("../dtos/articles.dto");
const AppResponseDto = require("../dtos/app_response.dto");

const Comment = require('../models/comment.model');
const Article = require('../models/article.model');
const Tag = require('../models/tag.model');
const Category = require('../models/category.model');
// const Comment = require('../models/comment.model');
const User = require('../models/user.model');
// const appRenderer = require('./app.renderer');


exports.indexNotUsed = function (req, res, next) {

    return Promise.all([
        // First promise
        Article.find()
            .limit(Number(req.pageSize))
            .skip(Number(req.page - 1) * req.pageSize)
            .sort({created_at: 'desc'})
            .populate('tags', 'name')
            .populate('user', 'username')
            .exec(),
        // Second promise
        Article.count().exec(),
        // Third promise

    ]).then(function (results) {
        var articles = results[0];
        var articlesCount = results[1];

        return res.json(PageMetaDto.build(page));
        /*{
            success: true,
                articles, // : articles.map(article => article.toJson()),
                articlesCount
        :
            articlesCount
        }*/
    }).catch(next);

};
exports.index = function (req, res, next) {

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    return Promise.all([
        Article.find({})
            .limit(Number(pageSize))
            .skip(Number((page - 1) * pageSize))
            .sort({createdAt: 'desc'})
            .populate('user', 'username')
            .populate('tags', 'name')
            .populate('categories', 'name')
            .exec(),
        Article.count().exec(),
    ]).then(function (results) {
        const articles = results[0];
        const articlesCount = results[1];

        return res.json(ArticleListDto.buildPagedList(articles, page, pageSize, articlesCount, '/api/articles'));
    }).catch(next);
};

exports.getLiked = function (req, res, next) {

    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 5;

    Promise.all([
        req.params.username ? User.findOne({username: req.params.username}) : null
    ]).then(function (results) {
        const user = results[0];

        const query = {
            _id: {
                $in: user.likes
            }
        };

        return Promise.all([
            Article.find(query)
                .limit(Number(limit))
                .skip(Number(offset))
                .sort({createdAt: 'desc'})
                .populate('user')
                .exec(),
            Article.count(query).exec(),
            req.payload ? User.findById(req.payload.id) : null,
        ]).then(function (results) {
            const articles = results[0];
            const articlesCount = results[1];
            const user = results[2];

            return res.json({
                articles: articles.map(function (article) {
                    return article.toJSONFor(user);
                }),
                articlesCount: articlesCount
            });
        });
    }).catch(next);
};

exports.getByTagNotUsed = function (req, res, next) {
    if (typeof req.query.tag !== 'undefined') {
        query.tagList = {"$in": [req.query.tag]};
    }
};

exports.getByTagId = function (req, res, next) {
    query = {tags: {"$in": [req.params.tag_name]}};
    const pageSize = parseInt(req.query.page_size) || 5;
    const page = parseInt(req.query.page) || 1;
    Promise.all([
        Article.find(query)
            .limit(Number(pageSize))
            .skip(Number(pageSize * (page - 1)))
            .sort({created_at: 'desc'})
            .populate('user').populate('tags', 'name').populate('categories', 'name').exec(),
        Article.count(query).exec()
    ]).then(function (results) {
        const articles = results[0];
        const articlesCount = results[1];
        return res.json(ArticleListDto.buildPagedList(articles, page, pageSize, articlesCount, ''));
    }).catch(next);
};
exports.getByTag = function (req, res, next) {
    Tag.findOne({name: req.params.tag_name}).then(tag => {
        query = {tags: {"$in": [tag.id]}};
        const pageSize = parseInt(req.query.page_size) || 5;
        const page = parseInt(req.query.page) || 1;
        Promise.all([
            Article.find(query)
                .limit(Number(pageSize))
                .skip(Number(pageSize * (page - 1)))
                .sort({created_at: 'desc'})
                .populate('user').populate('tags', 'name').populate('categories', 'name').exec(),
            Article.count(query).exec()
        ]).then(function (results) {
            const articles = results[0];
            const articlesCount = results[1];
            return res.json(ArticleListDto.buildPagedList(articles, page, pageSize, articlesCount, ''));
        }).catch(next);
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('something went wrong ' + err))
    });

};

exports.getByCategoryId = function (req, res, next) {
    query = {categories: {"$in": [req.params.category_name]}};
    const pageSize = parseInt(req.query.page_size) || 5;
    const page = parseInt(req.query.page) || 1;

    Promise.all([
        Article.find(query)
            .limit(Number(req.pageSize))
            .skip(Number(pageSize * (page - 1)))
            .sort({created_at: 'desc'})
            .populate('user').populate('tags').populate('categories')
            .exec(),
        Article.count(query).exec()
    ]).then(function (results) {
        const articles = results[0];
        const articlesCount = results[1];
        return res.json(ArticleListDto.buildPagedList(articles, page, pageSize, articlesCount, ''));
    }).catch(next);
};
exports.getByCategory = function (req, res, next) {
    Category.findOne({name: req.params.category_name}).then(category => {
        query = {categories: {"$in": [category.id]}};
        const pageSize = parseInt(req.query.page_size) || 5;
        const page = parseInt(req.query.page) || 1;

        Promise.all([
            Article.find(query)
                .limit(Number(req.pageSize))
                .skip(Number(pageSize * (page - 1)))
                .sort({created_at: 'desc'})
                .populate('user').populate('tags').populate('categories')
                .exec(),
            Article.count(query).exec()
        ]).then(function (results) {
            const articles = results[0];
            const articlesCount = results[1];
            return res.json(ArticleListDto.buildPagedList(articles, page, pageSize, articlesCount, ''));
        }).catch(next);
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('Something is wrong' + err));
    });

};

exports.getByIdOrSlug = function (req, res, next) {
    Promise.all([
        req.user ? User(req.user.id) : null, // First promise
        req.article
            .populate('user', 'username')
            .populate('tags', 'name')
            .populate('categories', 'name')
            .populate('comments', 'content')
            .execPopulate()
        // .populate('user')
        //.execPopulate() // Second promise
    ]).then(results => {
        const user = results[0];// Get the user by id

        // Now the article is populated with user
        const article = results[1];
        return res.json(ArticleListDto.buildDetails(article, user));

    }).catch(err => {
        throw err;
    });
};

exports.createArticle = async function (req, res, next) {
    // TODO: remove this check, this should never happen, passport jwt calls our other method where we locatred the user
    User.findById(req.user.id).then(user => {
        if (!user) {
            return res.json({
                success: false,
                errors: {full_messages: ['User does not exist']}
            }, 404);
        }

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

                const article = new Article({
                    title: req.body.title,
                    description: req.body.description,
                    body: req.body.body,
                    tags: tags,
                    categories: categories
                });

                article.user = user;
                return article.save().then(function (article) {
                    console.log(2);
                    return res.json(ArticleListDto.buildDetails(article, user))
                }).catch(err => {
                    res.status(500).json({
                        success: false, full_messages: err
                    })
                    //next();
                });
            }).catch(err => {
            console.error(err);
            return res.json('Error');

        });

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
                return res.json(ArticleListDto.buildDetails(article, req.user))
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