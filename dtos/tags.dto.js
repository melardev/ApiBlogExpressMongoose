function buildSummaries(tags) {
    return {
        tags: tags.map(tag => {
            return {
                id: tag.id,
                name: tag.name,
            };
        })
    }
}

module.exports = {
    buildSummaries
};