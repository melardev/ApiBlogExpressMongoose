const mongoose = require('mongoose');
const slug = require('slug');
const categorySchema = new mongoose.Schema({
    name: {type: String},
    slug: {type: String, unique: true, required: true},
    description: {type: String},
    articles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
});

categorySchema.pre('validate', function (next) {
    this.slug = slug(this.name);
    next();
});

categorySchema.methods.getDto = function () {
    return {
        id: this._id,
        name: this.name
    };
};

categorySchema.statics.findOneOrCreateWith = async function findOneOrCreateWith(condition, doc) {
    const one = await this.findOne(condition);

    return one || this.create(doc);
};

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;