const express = require('express');
const router = express.Router();

const passport = require('passport');
const articlesController = require('../controllers/articles.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const requiresValidJwt = passport.authenticate('jwt', {session: false});


require('./param_loaders/articles.loader').init(router);


function initPage(req, res, next) {
    req.pageSize = 20;
    req.page = 1;
    if (req.query.pageSize !== null)
        req.pageSize = req.query.pageSize;


    if (req.query.page !== null)
        req.page = req.query.page;
}

router.get('', articlesController.index);

router.get('/:article', articlesController.getByIdOrSlug);
//router.get('/by_id/:article_id', articlesController.getByIdOrSlug);
router.get('/by_tag/:tag_name', articlesController.getByTag);
router.get('/by_category/:category_name', articlesController.getByCategory);

router.post('', requiresValidJwt, AuthMiddleware.isAuthorOrAdmin, articlesController.createArticle);
// router.put('/:article', requiresValidJwt, articlesController.updateArticle);
router.put('/:article', requiresValidJwt, articlesController.updateArticle);
router.delete('/:article', requiresValidJwt, AuthMiddleware.isAuthorOrAdmin, AuthMiddleware.ownsArticleOrIsAdmin, articlesController.deleteArticle);
// Update article
module.exports = router;
