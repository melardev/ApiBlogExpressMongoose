# Introduction
Api Blog application built wit NodeJs Express and Mongoose, project far from finished.

# Play with the models
``js
db.comments.count({replies: {$exists: true, $not: {$size: 0}}})
db.post.find({'author.$id': 'foo'})
db.users.count({roles: {$exists: true, $in: [ObjectId('5c00ff848e15881074f622f6')]}})
db.comments.count({replies: {$exists: true, $not: {$size: 0}})
db.comments.aggregate({$project: { numberOfReplies: {$size: '$replies'}}})

// count replies count
// inline, from https://glassonionblog.wordpress.com/2013/04/07/mongodb-aggregate-lengths-of-neste-arrays/
db.comments.mapReduce(function(){emit('replies', {count: this.replies.length});}, function(key,values){var result={count:0}; values.forEach(function(value){result.count +=value.count;});return result}, {out: {inline:1}})
{ $where: "this.following.length > 1" }
```

# TODO
- Populate comments_count in articles.index
- Seed likes
- Refactor the user subscriptions(following/follower pattern)
- Improve seeding user subscriptions, it does not check if already following
- Fix comments not showing in dto. ArticleController.getBySlugOrId
- Refractor user model, I use pdkfb2 which i replaced by bcrypt
- Replace bcrypt-nodejs by bcrypt
- Customize Passport unauthorized response
- Get by tag Name, working only for by tag Id
- Move the param loaders to app.js
- The first time the seed runs, the users array contains a bunch of nulls
this is the reason why comments have user = null, fix it.
- Improve error messages, for example if article creation fails
- Find a way to paginate user subscriptions

