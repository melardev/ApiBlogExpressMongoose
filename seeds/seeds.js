const User = require('../models/user.model');
const Role = require('../models/role.model');
const Tag = require('../models/tag.model');
const Category = require('../models/category.model');
const Article = require('../models/article.model');
const Comment = require('../models/comment.model');
const faker = require('faker');

let authorRole;
const tags = [];
const categories = [];

async function seedAdminFeature() {
    console.log('[+] Seeding Admin feature');

    await Promise.all([
        Role.findOneOrCreateWith({name: 'ROLE_ADMIN'}, {
            name: 'ROLE_ADMIN',
            description: 'For admin users'
        }),
        User.find({username: 'admin'})
    ]).then(async results => {
        const role = results[0];
        let user = results[1];
        if (user.length === 0) {
            user = new User({
                username: 'admin',
                password: 'password',
                email: 'admin@api_mongoose.com',
                firstName: 'adminFN',
                lastName: 'adminLN',
                roles: [role]
            });
            role.users.push(user);
            Promise.all([user.save(), role.save()]).then(results => {

            }).catch(err => {
                console.error(err);
                process.exit(-1);
            });
        }
    }).catch(err => {
        throw err;
    });
}

async function seedAuthorsFeature() {
    await Role.findOneOrCreateWith({name: 'ROLE_AUTHOR'}, {
        name: 'ROLE_AUTHOR',
        description: 'for authors'
    }).then(async role => {
        const query = {
            // roles: {"$in": [role._id]} // also works
            roles: {"$in": [role]}
        };

        authorRole = role;

        await User.count(query).then(async count => {
            let authorsToSeed = 5;
            authorsToSeed -= count;
            console.log(`[+] Seeding ${authorsToSeed} authors`);
            if (authorsToSeed === 0) {
                return;
            }
            for (let i = 0; i < authorsToSeed; i++) {
                const user = new User({
                    username: faker.name.firstName() + faker.name.lastName(),
                    password: 'password',
                    email: faker.internet.email(),
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    roles: [role]
                });
                role.users.push(user);
                await user.save()
                    .then(results => {

                    }).catch(err => {
                        console.error(err);
                    });
            }
            await role.save().then(role => {
            }).catch(err => {
                console.error(err);
            })
        }).catch(err => {
            console.error(err);
        });
    }).catch(err => {
        throw err;
    });
}

async function seedUsersFeature() {
    await Role.findOneOrCreateWith({name: 'ROLE_USER'}, {
        name: 'ROLE_USER',
        description: 'For authenticated users'
    }).then(async role => {

        const query = {
            // roles: {"$in": [role._id]} // also works
            roles: {$in: [role]}
        };

        await User.count(query).then(async count => {
            let usersToSeed = 25;
            usersToSeed -= count;
            console.log(`[+] Seeding ${usersToSeed} users`);
            if (usersToSeed <= 0)
                return;
            for (let i = 0; i < usersToSeed; i++) {
                const user = new User({
                    username: faker.name.firstName() + faker.name.lastName(),
                    password: 'password',
                    email: faker.internet.email(),
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    roles: [role]
                });
                role.users.push(user);
                await user.save().then(results => {
                }).catch(err => {
                    console.error(err);
                });
            }
            await role.save().then(role => {
            }).catch(err => {
                console.error(err)
            });
        });
    }).catch(err => {
        console.error(err);
    });
}


function seedTags() {
    return Promise.all([
        Tag.findOneOrCreateWith({name: 'Spring'}, {
            name: 'Spring',
            description: 'Spring tutorial'
        }),
        Tag.findOneOrCreateWith({name: 'Rails'}, {
            name: 'Rails',
            description: 'Rails tutorial'
        }),
        Tag.findOneOrCreateWith({name: 'Node'}, {
            name: 'Node',
            description: 'Node tutorial'
        })]).then(results => {

        tags.push(results[0]);
        tags.push(results[1]);
        tags.push(results[2]);

    }).catch(err => console.error(err));
}


function seedCategories() {
    return Promise.all([
        Category.findOneOrCreateWith({name: 'Java'}, {
            name: 'Java',
            description: 'Java tutorial'
        }),
        Category.findOneOrCreateWith({name: 'Dotnet'}, {
            name: 'PHP',
            description: 'PHP tutorial'
        }),
        Category.findOneOrCreateWith({name: 'Dotnet'}, {
            name: 'Dotnet',
            description: 'Dotnet tutorial'
        })]).then(results => {
        categories.push(results[0]);
        categories.push(results[1]);
        categories.push(results[2]);
    }).catch(err => console.error(err));

}

async function seedArticles() {
    // faker.lorem.paragraphs
    // faker.lorem.sentence
    // faker.random.number

    await Article.count().then(async count => {
        let articlesToSeed = 17;
        articlesToSeed -= count;
        if (articlesToSeed <= 0) {
            return;
        }

        await User.find({roles: {$in: authorRole.id}})
        //await User.find({}).populate({path: 'roles', match: {name: 'ROLE_AUTHOR'}}).exec()
            .then(async authors => {
                for (let i = 0; i < articlesToSeed; i++) {
                    let author = authors[Math.floor(Math.random() * authors.length)];
                    let tag = tags[Math.floor(Math.random() * tags.length)];
                    let category = categories[Math.floor(Math.random() * categories.length)];
                    const article = new Article({
                        title: faker.lorem.words(),
                        description: faker.lorem.sentences(2),
                        body: faker.lorem.text(),
                        tags: [tag],
                        categories: [category],
                        user: author,
                        likesCount: faker.random.number({min: 0, max: 200}),
                        views: faker.random.number({min: 0, max: 10000}),
                    });
                    author.articles.push(article);
                    tag.articles.push(article);
                    category.articles.push(article);
                    await Promise.all([article.save(), author.save(), tag.save(), category.save()]).then(results => {

                    }).catch(err => {
                        throw err;
                    });
                }
            });
    }).catch(err => {
        throw err;
    });
}

async function seedComments() {
    await Comment.count().then(async count => {

        let commentsToSeed = 120;
        commentsToSeed -= count;
        if (commentsToSeed <= 0) {
            console.log('[+] Skipping comments seeds, there are many already.');
            return;
        }

        console.log(`[+] Seeding ${commentsToSeed} comments`);
        await Promise.all([
            Article.find({}),
            User.find({})
        ]).then(async results => {
            const articles = results[0];
            const users = results[1];

            for (let i = 0; i < commentsToSeed; i++) {
                let article = articles[Math.floor(Math.random() * articles.length)];
                let user = users[Math.floor(Math.random() * users.length)];
                const comment = new Comment({
                    content: faker.lorem.sentence(),
                    user,
                    article
                });
                article.comments.push(comment);
                user.comments.push(comment);
                await Promise.all([comment.save(), article.save()]).then(results => {

                }).catch(err => {
                    throw err;
                });
            }

        }).catch(err => {
            console.log(err);
        });

    });
}

// Not used
function seedReplies2() {


    /*Comment.count({
        replies: {
            $exists: true,
            $not: {$size: 0}
        }
    }

    Comment.Aggregate({
        $project: {
            name: 1,
            repliesCount: {$size: "$replies"}
        }
    }
    */
    cb();
    return;
    const result = Comment.aggregate().project({
        repliesCount: {$size: "$replies"}
    }, function (err, count) {

        let commentsToSeed = 37;
        commentsToSeed -= count;
        if (commentsToSeed <= 0) {
            console.log('[+] Skipping comments seeds, there are many already.');
            cb();
            return;
        }

        console.log(`[+] Seeding ${commentsToSeed} comments`);
        Promise.all([
            Article.find({}),
            User.find({})
        ]).then(results => {
            const articles = results[0];
            const users = results[1];

            for (let i = 0; i < commentsToSeed; i++) {
                const comment = new Comment({
                    content: faker.lorem.sentence(),
                    user: users[Math.floor(Math.random() * users.length)],
                    article: articles[Math.floor(Math.random() * articles.length)]
                });
                comment.save().then(article => {
                    comments.push(article);

                }).catch(err => {
                    throw err;
                });
            }

        }).catch(err => {
        });

    });
}

async function seedReplies() {

    await Comment.count({
        parent: {$exists: true}
    }).then(async count => {

        let repliesToSeed = 27;
        repliesToSeed -= count;
        if (repliesToSeed <= 0) {
            console.log('[+] Skipping replies seeds, there are many already.');
            return;
        }

        console.log(`[+] Seeding ${repliesToSeed} replies`);
        await Promise.all([
            Article.find({}),
            Comment.find({}), // take any, replies included.
            User.find({})
        ]).then(async results => {
            const articles = results[0];
            const comments = results[0];
            const users = results[2];

            await new Comment({
                content: faker.lorem.sentence(),
                user: users[Math.floor(Math.random() * users.length)],
                replies: [
                    comments[Math.floor(Math.random() * comments.length)],
                    comments[Math.floor(Math.random() * comments.length)],
                ],
                article: articles[Math.floor(Math.random() * articles.length)]
            }).save().then(test => {
            });
            for (let i = 0; i < repliesToSeed; i++) {
                let parent = comments[Math.floor(Math.random() * comments.length)];
                let article = articles[Math.floor(Math.random() * articles.length)];
                const reply = new Comment({
                    content: faker.lorem.sentence,
                    user: users[Math.floor(Math.random() * users.length)],
                    parent,
                    article
                });

                reply.user.comments.push(reply);
                article.comments.push(reply);
                parent.replies.push(reply);

                await Promise.all([reply.save(), reply.user.save(), article.save(), parent.save()]).then(results => {

                }).catch(err => {
                    throw err;
                });
            }

        }).catch(err => {
        });

    }).catch(err => {
        throw err;
    });
}

async function seedUserSubscriptions() {
    await User.count(
        // {following: {$gte: 0}}
        {$where: "this.following.length > 1"}
    ).then(async usersWithAtLeastOneFollowing => {
        // if 4 people have following array populated we assume we have seeded this feature already so return
        if (usersWithAtLeastOneFollowing > 4)
            return;

        let promises = [];
        const query = {
            roles: {"$in": [authorRole]}
        };

        promises.push(User.find(query));
        promises.push(User.find({}));


        await Promise.all(promises).then(async results => {
            const authors = results[0];
            if (authors[0].followers.length === 1)
                return;
            let allUsers = results[1];
            for (let i = 0; i < allUsers.length; i++) {
                for (let j = 0; j < faker.random.number({min: 0, max: 2}); j++) {
                    let following = authors[Math.floor(Math.random() * authors.length)];
                    let follower = allUsers[Math.floor(Math.random() * allUsers.length)];

                    await follower.follow(following).then(res => {
                        const placeABreakpointOnMe = true;
                    }).catch(err => {
                        console.error(err.toString());
                    });
                }
            }
        });
    }).catch(err => {
        throw err;
    })
}

exports.seed = async () => {
    await seedAdminFeature();
    await seedAuthorsFeature();
    await seedUsersFeature();
    await seedTags();
    await seedCategories();
    await seedArticles();
    await seedComments();
    await seedReplies();
    await seedUserSubscriptions();
    console.log('[+] Finished seeding');
    process.exit();
};