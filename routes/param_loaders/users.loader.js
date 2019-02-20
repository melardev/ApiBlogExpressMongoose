const User = require('../../models/user.model');

function init(router) {
    // Preload article objects on routes with ':article'
    router.param('user', function (req, res, next, username) {
        User.findOne({username: username})
            .populate('roles')
            .then(function (user) {
                if (!user) {
                    return res.sendStatus(404);
                }

                req.requested_user = user;
                return next();
            }).catch(next);
    });
}

module.exports = {
    init
};