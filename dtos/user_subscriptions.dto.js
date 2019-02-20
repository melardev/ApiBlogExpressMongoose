const UserDto = require('./users.dto');
const PageMetaDto = require('./page_meta.dto');

function buildPagedList(following, followers, page, pageSize, totalArticlesCount, basePath) {
    return {
        success: true,
        page_meta: PageMetaDto.build(page, pageSize, totalArticlesCount, basePath),
        following: buildSummaries(following),
        followers: buildSummaries(followers),
    }
}

function buildSummaries(users) {
    return users.map(user => UserDto.buildOnlyForIdAndUsername(user))
}


module.exports = {
    buildSummaries, buildPagedList
};