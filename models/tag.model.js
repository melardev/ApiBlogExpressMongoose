const mongoose = require('mongoose');
const slug = require('slug');
const findOrCreate = require('mongoose-find-or-create');
const tagSchema = new mongoose.Schema({
    name: {type: String},
    slug: {type: String, unique: true},
    description: {type: String},
    articles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
});
tagSchema.plugin(findOrCreate);
tagSchema.pre('validate', function (next) {
    this.slug = slug(this.name);
    next();
});


tagSchema.methods.getDto = function () {
    return {
        id: this._id,
        name: this.name
    };
};

tagSchema.statics.findOneOrCreateWith = async function findOneOrCreateWith(condition, doc) {
    const one = await this.findOne(condition);

    return one || this.create(doc);
};

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;