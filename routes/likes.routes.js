const express = require('express');
const router = express.Router();
const passport = require('passport');
const requiresValidJwt = passport.authenticate('jwt', {session: false});
const likesController = require('../controllers/likes.controller');
require('./param_loaders/articles.loader').init(router);
router.get('/likes', requiresValidJwt, likesController.myLikes);
router.post('/articles/:article/likes', requiresValidJwt, likesController.likeArticle);
router.delete('/articles/:article/likes', requiresValidJwt, likesController.unlikeArticle);

module.exports = router;