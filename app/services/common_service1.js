module.exports = {
    paginationFn: async (
        res,
        model,
        findQuery,
        perPage = 10,
        currentPage = 0,
        populateValues = null,
        sort = null,
        select = null,
    ) => {
        console.log('findQuery', findQuery)
        try {
            const numOfLessons = await model.find(findQuery).countDocuments()
            const currPage = parseInt(currentPage)
            console.log('numOfLessons', numOfLessons, sort)
            const data = await model
                .find(findQuery)
                .populate(populateValues)
                .limit(perPage)
                .skip(perPage * currPage)
                .sort(sort)
                .select(select)
            return {
                rows: data,
                pagination: {
                    currPage,
                    pages: Math.ceil(numOfLessons / perPage),
                    total: numOfLessons,
                },
            }
        } catch (error) {
            console.log('error--------', error);
            return error
        }
    },
    paginationArray: async (array, perPage, currentPage) => {
        const itemsPerPage = perPage ? parseInt(perPage) : 10;
        // Get the "page" query parameter from the request
        console.log('items------per page-------', itemsPerPage);
        const page = parseInt(currentPage) || 0;
        console.log('page----------', parseInt(currentPage));
        // Calculate the starting index and ending index for the current page
        const startIndex = page * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const totalPages = Math.ceil(array.length / itemsPerPage);
        const data = array.slice(startIndex, endIndex);
        return {
            rows: data,
            pagination: {
                currentPage: page || 0,
                pages: totalPages,
                total: array.length
            }
        };
    },
    errorHandlerFunction: (res, error) => {
        if (error?.status) {
            if (error.status < 500) {
                return res.clientError({
                    ...error.error,
                    statusCode: error.status,
                })
            } else {
                return res.internalServerError({ ...error.error })
            }
        } else {
            return res.clientError({ msg: 'something went wrong' })
        }
    },
}


