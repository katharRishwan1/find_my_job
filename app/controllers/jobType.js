const { roleNames } = require('../config/config');
const responseMessages = require('../middlewares/response-messages');
const db = require('../model');
const { errorHandlerFunction } = require('../services/common_service1');
const validator = require('../validator/jobType')
module.exports = {
    post: async (req, res) => {
        try {

            const { error } = await validator.validateCreate(req.body)
            if (error) {
                return res.clientError({
                    msg: error
                })
            }

            const checkExists = await db.jobType.findOne({ shopType: req.body?.shopType, name: req.body?.name, isDeleted: false })
            if (checkExists) {
                return res.clientError({
                    msg: `Similar Job type Name already exists..`,
                })
            }
            const data = await db.jobType.create(req.body)
            if (data && data._id) {
                return res.success({
                    msg: 'Job type created',
                    result: data,
                })
            }
            return res.clientError({
                msg: 'Job type Creation Failed',
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    get: async (req, res) => {
        try {
            const _id = req.params.id
            const { search, sortBy } = req.query
            const filter = { isDeleted: false, status: 'active' }
            if (req.decoded.roleType === roleNames.ad) {
                delete filter.status
            }
            if (_id) {
                filter._id = _id
                const data = await db.jobType.findOne(filter).populate('shopType', 'name')
                if (data) {
                    return res.success({
                        msg: responseMessages[1008],
                        result: data,
                    })
                }
                return res.clientError({
                    msg: responseMessages[1012],
                })
            }
            if (search) filter.name = { $regex: search, $options: 'i' }

            let sort = { createdAt: -1 }
            if (sortBy === 'oldest') sort = { createdAt: 1 }
            else if (sortBy === 'latest') sort = { createdAt: -1 }

            const getRoles = await db.jobType.find(filter).populate('shopType', 'name').sort(sort)

            if (!getRoles.length) {
                return res.success({
                    msg: responseMessages[1012],
                    result: getRoles,
                })
            }
            return res.success({
                msg: 'Job type Data Fetched',
                result: getRoles,
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    update: async (req, res) => {
        try {
            const _id = req.params.id;

            const { error } = await validator.validateUpdate(req.body)
            if (error) {
                return res.clientError({
                    msg: error
                })
            }

            const filterQuery = { isDeleted: false, _id };
            const checkEixsts = await db.jobType.findOne(filterQuery);
            if (!checkEixsts) {
                return res.clientError({
                    msg: 'Job type Not Found..!'
                });
            };
            const checkUnique = await db.jobType.findOne({ _id: { $ne: _id }, name: req?.body?.name, isDeleted: false });
            if (checkUnique) {
                return res.clientError({
                    msg: `${checkUnique.name} this type of Job type is Already taken`
                });
            };
            const data = await db.jobType.updateOne(filterQuery, req.body);
            if (data.modifiedCount) {
                return res.success({
                    result: data,
                    msg: 'Job type Updated Successfully..!'
                })
            };
            return res.clientError({
                msg: 'Job type Update Failed...!'
            });
        } catch (error) {
            errorHandlerFunction(error)
        }
    },
    delete: async (req, res) => {
        try {
            const filterQuery = { _id: req.params.id, isDeleted: false };
            const checkEixst = await db.jobType.findOne(filterQuery);
            if (!checkEixst) {
                return res.clientError({
                    msg: 'Job type Not Found..!'
                });
            };
            const data = await db.jobType.updateOne(filterQuery, { isDeleted: true });
            if (data.modifiedCount) {
                return res.success({
                    result: data,
                    msg: 'Job type Deleted Successfully..!'
                })
            };
            return res.clientError({
                msg: 'Job type Delete Failed...!'
            });
        } catch (error) {
            errorHandlerFunction(error)
        }
    },
    status: async (req, res) => {
        try {
            const id = req.params.id
            const data = await db.jobType.findOne({ _id: id, isDeleted: false })
            if (!data) {
                return res.clientError({
                    msg: "Data not found"
                })
            }

            const status = data.status === 'active' ? 'inactive' : 'active'
            data.status = status
            await data.save()
            return res.success({
                msg: 'Job type status updated',
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
};