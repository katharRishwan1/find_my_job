const { roleNames } = require('../config/config');
const responseMessages = require('../middlewares/response-messages');
const db = require('../model');
const { errorHandlerFunction } = require('../services/common_service1');
const { bcrypt } = require('../services/imports');
const validator = require('../validator/shopType')
module.exports = {
    post: async (req, res) => {
        try {

            const filterArray = [{ mobile: req.body.mobile }]
            if (req.body.email) filterArray.push({ email: req.body.email })

            const checkExists = await db.user.findOne({ isDeleted: false, $or: filterArray })
            if (checkExists) {
                return res.clientError({ msg: responseMessages[1014] })
            }
            const getRole = await db.role.findOne({ name: roleNames.own, isDeleted: false })

            const hashedPassword = await bcrypt.hashSync(req.body.password, 8)
            req.body.password = hashedPassword
            req.body.role = getRole._id.toString()
            req.body.createdBy = req.decoded.user_id

            const data = await db.user.create(req.body)
            if (data) {

                req.body.owner = data._id
                const shop = await db.shop.create(req.body)
                if (shop) {
                    return res.success({
                        msg: 'Shop type created',
                        result: shop,
                    })
                }
                return res.clientError({
                    msg: 'Shop type Creation Failed',
                })
            }
            return res.clientError({
                msg: 'Shop Creation Failed..!',
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
            const populateValue = [
                { path: "owner", select: 'firstName lastName email mobile img_url' },
                { path: 'shopType', select: 'name' },
                { path: 'jobType', select: 'name' }
            ]
            if (_id) {
                filter._id = _id
                const data = await db.shop.findOne(filter).populate(populateValue)
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

            const getRoles = await db.shop.find(filter).populate(populateValue).sort(sort)
            if (!getRoles.length) {
                return res.success({
                    msg: responseMessages[1012],
                    result: getRoles,
                })
            }
            return res.success({
                msg: 'Shop Data Fetched',
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
            const checkEixsts = await db.shopType.findOne(filterQuery);
            if (!checkEixsts) {
                return res.clientError({
                    msg: 'Shop type Not Found..!'
                });
            };
            const checkUnique = await db.shopType.findOne({ _id: { $ne: _id }, name: req?.body?.name, isDeleted: false });
            if (checkUnique) {
                return res.clientError({
                    msg: `${checkUnique.name} this type of Shop type is Already taken`
                });
            };
            const data = await db.shopType.updateOne(filterQuery, req.body);
            if (data.modifiedCount) {
                return res.success({
                    result: data,
                    msg: 'Shop type Updated Successfully..!'
                })
            };
            return res.clientError({
                msg: 'Shop type Update Failed...!'
            });
        } catch (error) {
            errorHandlerFunction(error)
        }
    },
    delete: async (req, res) => {
        try {
            const filterQuery = { _id: req.params.id, isDeleted: false };
            const checkEixst = await db.shopType.findOne(filterQuery);
            if (!checkEixst) {
                return res.clientError({
                    msg: 'Shop type Not Found..!'
                });
            };
            const data = await db.shopType.updateOne(filterQuery, { isDeleted: true });
            if (data.modifiedCount) {
                return res.success({
                    result: data,
                    msg: 'Shop type Deleted Successfully..!'
                })
            };
            return res.clientError({
                msg: 'Shop type Delete Failed...!'
            });
        } catch (error) {
            errorHandlerFunction(error)
        }
    },
    status: async (req, res) => {
        try {
            const id = req.params.id
            const data = await db.shopType.findOne({ _id: id, isDeleted: false })
            if (!data) {
                return res.clientError({
                    msg: "Data not found"
                })
            }

            const status = data.status === 'active' ? 'inactive' : 'active'
            data.status = status
            await data.save()
            return res.success({
                msg: 'Shop type status updated',
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
};