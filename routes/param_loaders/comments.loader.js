const Comment = require('../../models/comment.model');

function init(router) {
    router.param('comment', function (req, res, next, id) {
        Comment.findById(id).then(function (comment) {
            if (!comment) {
                return res.sendStatus(404);
            }

            req.comment = comment;
            return next();
        }).catch(next);
    });


    router.param('comment_id', function (req, res, next, id) {
        Comment.findById(id).then(function (comment) {
            if (!comment) {
                return res.json({
                    success: false,
                    errors: {full_messages: ['Not found']}
                }, 404);
            }
            req.comment=comment;
            next();
        }).catch(next);
    });
};

module.exports = {
    init
};