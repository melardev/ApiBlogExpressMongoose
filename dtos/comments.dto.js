const UserDto = require('./users.dto');

const PageMetaDto = require('./page_meta.dto');

function buildPagedList(comments, page, pageSize, totalArticlesCount, basePath, includeUser, includeArticle) {
    return {
        success: true,
        page_meta: PageMetaDto.build(page, pageSize, totalArticlesCount, basePath),
        ...getDtos(comments, includeUser, includeArticle),
        //articles: articles.map(article => article.getJsonSummary())
    }
}

function getDtos(comments, includeUser = false, includeArticle = false) {
    return {
        comments: comments.map(comment => getDto(comment, includeUser, includeArticle))
    };
}

function getDto(comment, includeUser = false, includeArticle = false) {
    const dto = {
        id: comment.id,
        content: comment.content,
    };
    if (includeUser)
        dto['user'] = UserDto.buildOnlyForIdAndUsername(comment.user);
    if (includeArticle) {
        // article: ArticlesDto.buildOnlyForIdAndSlug(comment.article),
        dto['article'] = {
            id: comment.article.id,
            slug: comment.article.slug
        };
    }
    return dto;
}

function buildDetails(comment) {
    return {
        success: true,
        ...getDto(comment),
        created_at: comment.createdAt,
        updated_at: comment.updatedAt
    }
}

module.exports = {
    buildSummaries: getDtos, buildSummary: getDto, buildDetails, buildPagedList
};