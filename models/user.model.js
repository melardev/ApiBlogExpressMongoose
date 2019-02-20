const mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');
// const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'JWT_SUPER_SECRET';
const Role = require('./role.model');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        // lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
        index: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true
    },
    firstName: {
        type: String,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z]+$/, 'is invalid'],
    },
    lastName: {
        type: String,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z]+$/, 'is invalid'],
    },
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
        index: true
    },

    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
    // likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Like'}],
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    password: {type: String, required: true},
    articles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
}, {timestamps: true});


UserSchema.path('password', {
    set: function (password) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        return hashedPassword;
        /* // The async way
                bcrypt.genSalt(10, function (err, salt) {
                    if (err)
                        throw err;

                    bcrypt.hash(password, salt, null, function (err, hash) {
                        if (err)
                            throw err;
                        return hash;
                    });
                });
        */
    }
});
// UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});
UserSchema.pre('save', function (next) {
    const user = this;
    if (user.roles != null && user.roles.length > 0)
        next();
    else {
        Role.findOne({name: 'ROLE_USER'}).then(role => {
            user.roles = [role];
            next();
        }).catch(err => {
            next(err);
        });
    }
});

// Not used
UserSchema.methods.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.isValidPassword = function (candidatePassword, callback) {
    // Since we used path('password') now password is no longer a simple string, but an object, to access its value we can:
    // bcrypt.compareSync(candidatePassword, this.get('password'))
    bcrypt.compare(candidatePassword, this.password.toObject(), function (err, isMatch) {
        if (err)
            return callback(err);
        callback(null, isMatch);
    })
};


UserSchema.methods.generateJwt = function () {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        user_id: this._id,
        sub: this.id,
        username: this.username,
        iat: new Date().getTime(),
        exp: parseInt(exp.getTime() / 1000),
    }, secret, process.env.JWT_ALGO | 'HS512');
};

function generateToken(user) {
    const jwt = require('jwt-simple');
    const timestamp = new Date().getTime();
    return jwt.encode({
            sub: user.id,
            id: user.id,
            iat: timestamp
        }, process.env.JWT_SECRET || 'JWT_SUPER_SECRET',
        'HS512');
}


UserSchema.methods.like = function (articleId) {
    if (this.likes.indexOf(articleId) === -1) {
        this.likes.push(articleId);
    }
    return this.save();
};

UserSchema.methods.dislike = function (articleId) {
    this.likes.remove(articleId);
    return this.save();
};

UserSchema.methods.isLiking = function (someArticleId) {
    // Iterate through the likes array which contains Object Ids of liked articles
    return this.likes.some(articleId => articleId.toString() === someArticleId.toString());
};

UserSchema.methods.follow = function (user) {
    if (this.id === user.id) {
        return Promise.reject(new Error(`You can not follow yourself`))
    } else if (this.following.indexOf(user.id) === -1) {
        this.following.push(user.id);
        user.followers.push(this.id);
        return Promise.all([this.save(), user.save()]);
    } else {
        return Promise.reject(new Error(`You are already following the ${user.username}`))
    }
};

UserSchema.methods.unfollow = function (user) {
    if (this.following.indexOf(user.id) !== -1) {
        this.following.remove(user.id);
        // or the same effect using splice( , 1):
        // this.following.splice(this.following.indexOf(user.id), 1);
        user.followers.splice(user.followers.indexOf(this.id), 1);
        return Promise.all([this.save(), user.save()]);
    } else {
        return Promise.reject(new Error(`You are not following ${user.username}`))
    }
};

UserSchema.methods.isFollowing = function (id) {
    return this.following.some(function (followId) {
        return followId.toString() === id.toString();
    });
};

UserSchema.methods.isAdmin = function () {
    return !!this.roles.find(r => r.name === 'ROLE_ADMIN');
};
UserSchema.methods.isAuthor = function () {
    return !!this.roles.find(r => r.name === 'ROLE_AUTHOR');
};

const User = mongoose.model('User', UserSchema);
module.exports = User;