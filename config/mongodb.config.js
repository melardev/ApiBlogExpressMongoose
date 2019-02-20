const mongoose = require('mongoose');
exports.configure = function () {
    mongoose.Promise = global.Promise;
    mongoose.set('debug', true);
    mongoose.connection.on('error', function (err) {
        console.error(err);
    });
    const connection = mongoose.connection;
    connection.on('error', console.error.bind(console, 'connection error:'));
    connection.once('open', function () {
        console.log('[+] Connected to the database');
    });

    return mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/express_blog_api', {
        debug: true,
        keepAlive: true
    });
};




