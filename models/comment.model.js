const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    article: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Article'},
    // not used
    replies: [this]
}, {timestamps: true});


CommentSchema.methods.toJson = function (user) {
    return {
        id: this._id,
        content: this.content,
        created_at: this.created_at,
        user: this.user.toJson(user)
    };
};

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;