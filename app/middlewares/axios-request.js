const { axios } = require('../services/imports')

const request = {
    get: async (req, hitUrl, requestConfig = {}) => {
        try {
            const configData = {
                headers:
                    (requestConfig && requestConfig.headers) ||
                    (req && req.headers) ||
                    undefined,
                ...requestConfig,
            }
            const getResp = await axios.get(hitUrl, configData)
            return { data: getResp.data, status: getResp.status }
        } catch (error) {
            console.log('error', error)
            return Promise.reject({
                status: (error.response && error.response.status) || 500,
                error: (error.response && error.response.data) || error,
            })
        }
    },
    post: async (req, hitUrl, postData, requestConfig) => {
        try {
            // if (req.headers['content-length']) {
            //   delete req.headers['content-length'];
            // }
            const configData = {
                headers:
                    (requestConfig && requestConfig.headers) ||
                    (req && req.headers) ||
                    undefined,
                ...requestConfig,
            }
            const postResp = await axios.post(hitUrl, postData, configData)
            return { data: postResp.data, status: postResp.status }
        } catch (error) {
            console.log('error', error)
            return Promise.reject({
                status: (error.response && error.response.status) || 500,
                error: (error.response && error.response.data) || error,
            })
        }
    },
    put: async (req, hitUrl, putData, requestConfig) => {
        if (req.headers['content-length']) {
            delete req.headers['content-length']
        }
        try {
            const configData = {
                headers:
                    (requestConfig && requestConfig.headers) ||
                    (req && req.request.headers) ||
                    undefined,
                ...requestConfig,
            }
            const putResp = await axios.put(hitUrl, putData, configData)
            return { data: putResp.data, status: putResp.status }
        } catch (error) {
            return Promise.reject({
                status: (error.response && error.response.status) || 500,
                error: (error.response && error.response.data) || error,
            })
        }
    },
    patch: async (req, hitUrl, patchData, requestConfig) => {
        if (req.headers['content-length']) {
            delete req.headers['content-length']
        }
        try {
            const configData = {
                headers:
                    (requestConfig && requestConfig.headers) ||
                    (req && req.headers) ||
                    undefined,
                ...requestConfig,
            }
            const patchResp = await axios.patch(hitUrl, patchData, configData)
            return { data: patchResp.data, status: patchResp.status }
        } catch (error) {
            return Promise.reject({
                status: (error.response && error.response.status) || 500,
                error: (error.response && error.response.data) || error,
            })
        }
    },
    delete: async (req, hitUrl, requestConfig) => {
        if (req.headers['content-length']) {
            delete req.headers['content-length']
        }
        try {
            const configData = {
                headers:
                    (requestConfig && requestConfig.headers) ||
                    (req && req.request.headers) ||
                    undefined,
                ...requestConfig,
            }
            const deleteResp = await axios.delete(hitUrl, configData)
            return { data: deleteResp.data, status: deleteResp.status }
        } catch (error) {
            return Promise.reject({
                status: (error.response && error.response.status) || 500,
                error: (error.response && error.response.data) || error,
            })
        }
    },
}

module.exports = request
