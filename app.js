require('dotenv').config();
const express = require('express');
cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
//var compression = require('compression');
const passport = require('passport');

require('./models/user.model');
require('./models/tag.model');
require('./models/category.model');
require('./models/comment.model');
require('./models/role.model');

const benchmarkMiddleware = require("./middlewares/benchmark.middleware").benchmarkMiddleware;
const corsMiddleware = require("./middlewares/cors.middleware").corsMiddleware;
const AppResponseDto = require("./dtos/app_response.dto");
require('./config/passport.config')(passport);

const app = express();

require('./config/mongodb.config').configure().then(() => {

//app.use(compression());

    app.use(benchmarkMiddleware);
    // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(corsMiddleware);

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));


    const articles = require('./routes/articles.routes');
    const users = require('./routes/users.routes');
    const comments = require('./routes/comments.routes');
    const likes = require('./routes/likes.routes');
    const subscriptions = require('./routes/subscriptions.routes');

    app.use('/api/articles', articles);
    app.use('/api', comments);
    app.use('/api', likes);
    app.use('/api', users);
    app.use('/api', subscriptions);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


// app.use(function(err, req, res, next) {
//   console.error(err.stack);
//   console.log(1)
//   res.status(500).send('Uh oh! Something broke!');
// });


    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.json(AppResponseDto.buildWithErrorMessages('Something went wrong 5xx ' + err));
    });

});

module.exports = app;
