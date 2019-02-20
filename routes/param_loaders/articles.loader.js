const Article = require('../../models/article.model');

function init(router) {
    // Preload article objects on routes with ':article'
    router.param('article', function (req, res, next, slug) {
        Article.findOne({slug: slug})
            .populate('user')
            .populate('comments')
            .then(function (article) {
                if (!article) {
                    return res.sendStatus(404);
                }

                req.article = article;
                return next();
            }).catch(next);
    });


// place the article in the request object when :article_id is present in path
    router.param('article_id', function (req, res, next, slug) {

        new Promise((resolve, reject) => {
            Article.findOne({slug: slug})
                .populate('user').then(function (article) {
                if (!article) {
                    resolve(article);
                    return;
                }
                reject('Article Not found');
            });
        }).then(article => {
            req.article = article;
            return next();
        }).catch(err => {
            return res.json({
                success: false,
                errors: {full_messages: [err]}
            }, 404);
        });
    });
}

module.exports = {
    init
};