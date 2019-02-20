const router = require('express').Router();
require('./param_loaders/comments.loader').init(router);
require('./param_loaders/articles.loader').init(router);
const passport = require('passport');
const commentsController = require('../controllers/comments.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const requiresValidJwt = passport.authenticate('jwt', {session: false});

router.get('/articles/:article/comments', commentsController.getByArticleSlug);
router.post('/articles/:article/comments', requiresValidJwt, commentsController.createComment);
// router.put('/:article', requiresValidJwt, articlesController.updateArticle);
router.put('/:article/comments/:comment_id', requiresValidJwt, AuthMiddleware.ownsCommentOrIsAdmin, commentsController.updateComment);
router.put('/comments/:comment_id', requiresValidJwt, AuthMiddleware.ownsCommentOrIsAdmin, commentsController.updateComment);
router.delete('/articles/:article/comments/:comment_id', requiresValidJwt, AuthMiddleware.ownsCommentOrIsAdmin, commentsController.deleteComment);
router.delete('/comments/:comment_id', requiresValidJwt, AuthMiddleware.ownsCommentOrIsAdmin, commentsController.deleteComment);

module.exports = router;