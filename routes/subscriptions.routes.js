const router = require('express').Router();
const userSubscriptionsController = require('../controllers/user_subscriptions.controller');
const passport = require('passport');
const requiresValidJwt = passport.authenticate('jwt', {session: false});
require('./param_loaders/users.loader').init(router);

router.get('/users/subscriptions', requiresValidJwt, userSubscriptionsController.index);
router.post('/users/:user/followers', requiresValidJwt, userSubscriptionsController.followUser);
router.delete('/users/:user/followers', requiresValidJwt, userSubscriptionsController.unfollowUser);

module.exports = router;