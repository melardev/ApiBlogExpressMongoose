function initPage(req, res, next) {
    req.pageSize = 20;
    req.page = 1;
    if (req.query.pageSize !== null)
        req.pageSize = req.query.pageSize;


    if (req.query.page !== null)
        req.page = req.query.page;
}