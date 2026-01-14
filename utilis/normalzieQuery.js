export default (req, res, next) => {
    const query = { ...req.query };

    const singleValueQueries = ['sort', 'fields'];
    singleValueQueries.forEach((key) => {
        if (Array.isArray(query[key])) {
            query[key] = query[key].at(-1);
        }

    })
    req.normalizedQuery = query;
    next();
}