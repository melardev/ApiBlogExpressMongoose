const PageMetaDto = require("./page_meta.dto");
const TagDto = require("./tags.dto");
const CategoryDto = require("./categories.dto");
const UserDto = require("./users.dto");
const CommentsDto = require("./comments.dto");

function buildPagedList(articles, page, pageSize, totalArticlesCount, basePath) {
    return {
        success: true,
        page_meta: PageMetaDto.build(page, pageSize, totalArticlesCount, basePath),
        ...buildSummaries(articles),
        //articles: articles.map(article => article.getJsonSummary())
    }
}

function buildSummaries(articles) {
    return {
        articles: articles.map(article => buildSummary(article))
    };
}

function buildSummary(article) {
    return {
        id: article.id,
        slug: article.slug,
        title: article.slug,
        description: article.description,
        created_at: article.created_at,
        updated_at: article.updated_at,
        ...TagDto.buildSummaries(article.tags),
        ...CategoryDto.buildSummaries(article.categories),
        comments_count: 0,
        user: UserDto.buildOnlyForIdAndUsername(article.user)
    };
}

function buildDetails(article, user) {
    let article_result = buildSummary(article);
    article_result.body = article.body;
    // merge article_result fields with object returned from buildSummaries
    article_result = {article_result, ...CommentsDto.buildSummaries(article.comments, true, false)};
    article_result.likes_count = article.likes_count;
    return {
        success: true,
        article: article_result
    }
}

function buildOnlyForIdAndSlug(article) {
    return {success: true, slug: article.slug, id: article.id};
}

module.exports = {
    buildPagedList, buildSummaries, buildDetails, buildSummary, buildOnlyForIdAndSlug
};