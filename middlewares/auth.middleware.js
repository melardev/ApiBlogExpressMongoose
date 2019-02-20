const passport = require('passport');
const AppResponse = require('../dtos/app_response.dto');
const requiresValidJwt = passport.authenticate('jwt', {session: false});

const isAuthorOrAdmin = (req, res, next) => {
    if (req.user === null)
        return res.json(AppResponse.buildWithErrorMessages('Access denied, you re not Logged In'));

    if (req.user.isAuthor() || req.user.isAdmin())
        next();
    else
        return res.json(AppResponse.buildWithErrorMessages('Access denied, you re not an Author'));
};

function ownsArticleOrIsAdmin(req, res, next) {
    if (req.user != null && (req.user.isAdmin() || req.article.user._id.toString() === req.payload.id.toString()))
        next();
    else
        return res.json(AppResponse.buildWithErrorMessages('Something is wrong'));
}

function ownsArticle(req, res, next) {
    if (req.article.user._id.toString() === req.payload.id.toString())
        next();
    else
        return res.json(AppResponse.buildWithErrorMessages('This article does not belong to you'));
}

function ownsCommentOrIsAdmin(req, res, next) {
    if (req.user != null && (req.user.isAdmin() || req.comment.user._id.toString() === req.user.id.toString()))
        next();
    else
        return res.json(AppResponse.buildWithErrorMessages('This comment does not belong to you'));
}

function ownsLikeOrIsAdmin(req, res, next) {
    if (req.user != null && (req.user.isAdmin() || req.like.user._id.toString() === req.user.id.toString()))
        next();
    else
        return res.json(AppResponse.buildWithErrorMessages('This like does not belong to you'));
};
module.exports = {
    isAuthorOrAdmin, ownsArticleOrIsAdmin, ownsArticle, ownsCommentOrIsAdmin, ownsLikeOrIsAdmin
};