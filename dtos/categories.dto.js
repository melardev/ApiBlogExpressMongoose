function buildSummaries(categories) {
    return {
        categories: categories.map(category => {
            return {
                id: category.id,
                name: category.name,
            };
        })
    }
}

module.exports = {
    buildSummaries
};