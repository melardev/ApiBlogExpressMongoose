function ensureUserExists(req, res, next) {
    return User.findById(req.payload.id).then(function (user) {
        if (!user) {
            // Return Permission denied
            return res.json({
                success: false, full_messages: ['Permission denied, you have to be authenticated']
            }, 401);
        }
        req.user = user;
        // Proceed with the middleware chain
        return next();
    }).catch(err => {
        return res.json({
            success: false, full_messages: ['Something weird happend']
        });
    });
}