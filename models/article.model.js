const mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');
const User = mongoose.model('User');

const ArticleSchema = new mongoose.Schema({
    slug: {type: String, lowercase: true, unique: true, required: true},
    title: {type: String, required: [true, 'Title must not be emtpy']},
    description: {type: String, required: true},
    body: {type: String, required: true},
    likesCount: {type: Number, default: 0},
    views: {type: Number, default: 0},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Like'}]
}, {timestamps: true});


// ArticleSchema.plugin(uniqueValidator, {message: 'is already taken'});

ArticleSchema.pre('validate', function (next) {
    if (!this.slug) {
        this.slugify();
    }
    next();
});

ArticleSchema.methods.slugify = function () {
    this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

ArticleSchema.methods.updateFavoriteCount = function () {
    const article = this;

    return User.count({likes: {$in: [article._id]}}).then(function (count) {
        article.favoritesCount = count;

        return article.save();
    });
};

ArticleSchema.methods.getJsonSummary = function (user) {
    return {
        id: this.id,
        slug: this.slug,
        title: this.title,
        description: this.description,
        created_at: this.createdAt,
        updated_at: this.updatedAt,
        tags: this.tags.map(tag => tag.getDto()), // this is not needed, we only populated _id and name, so it is fine
        // but if I want to rename _id to id I created this method, there are other solutions to renaming fields, but a little harder than this
        categories: this.categories.map(category => category.getDto()),
        comments_count: this.comments.length,
        user: this.user
    }
};

ArticleSchema.methods.toJson = function () {
    return {
        slug: this.slug,
        title: this.title,
        description: this.description,
        body: this.body,
        created_at: this.createdAt,
        updated_at: this.updatedAt,
        tags: this.tags,
        categories: this.categories,
        likesCount: this.likesCount,
        user: this.user.username,
        comments: this.comments
    };
};
ArticleSchema.methods.increaseLikesByOne = function () {
    this.likesCount = this.likesCount + 1;
    return this.save();
};
const Article = mongoose.model('Article', ArticleSchema);
module.exports = Article;
