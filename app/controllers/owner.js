const { roleNames } = require('../config/config');
const responseMessages = require('../middlewares/response-messages');
const db = require('../model');
const { errorHandlerFunction } = require('../services/common_service1');
const { bcrypt } = require('../services/imports');
const validator = require('../validator/owner')
module.exports = {
    adminownerCreate: async (req, res) => {
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

            const data = await db.user.create(req.body)
            if (data) {
                return res.success({
                    msg: 'Signup success..!',
                    result: data
                })
            }
            return res.clientError({
                msg: 'owner Creation Failed..!',
            })

        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    ownerOnboarding: async (req, res) => {
        try {
            const checkExist = await db.user.findOne({ _id: req.decoded.user_id })
            if (!checkExist) {
                return res.clientError({
                    msg: "User Not Found..!"
                })
            }

            checkExist.firstName = req.body.firstName
            checkExist.lastName = req.body.lastName
            checkExist.img_url = req.body.img_url
            checkExist.email = req.body.email
            checkExist.password = await bcrypt.hashSync(req.body.password, 8)
            await checkExist.save()

            req.body.owner = checkExist._id
            const owner = await db.owner.create(req.body)
            if (owner) {
                return res.success({
                    msg: 'owner type created',
                    result: owner,
                })
            }
            return res.clientError({
                msg: 'owner type Creation Failed',
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
                { path: 'ownerType', select: 'name' },
                { path: 'jobType', select: 'name' }
            ]
            if (_id) {
                filter._id = _id
                const data = await db.owner.findOne(filter).populate(populateValue)
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
            if (req.decoded.roleType === roleNames.own) {
                filter.owner = req.decoded.user_id
            }
            if (search) filter.name = { $regex: search, $options: 'i' }

            let sort = { createdAt: -1 }
            if (sortBy === 'oldest') sort = { createdAt: 1 }
            else if (sortBy === 'latest') sort = { createdAt: -1 }


            const getRoles = await db.owner.find(filter).populate(populateValue).sort(sort)
            if (!getRoles.length) {
                return res.success({
                    msg: responseMessages[1012],
                    result: getRoles,
                })
            }
            return res.success({
                msg: 'owner Data Fetched',
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
            const checkEixsts = await db.ownerType.findOne(filterQuery);
            if (!checkEixsts) {
                return res.clientError({
                    msg: 'owner type Not Found..!'
                });
            };
            const checkUnique = await db.ownerType.findOne({ _id: { $ne: _id }, name: req?.body?.name, isDeleted: false });
            if (checkUnique) {
                return res.clientError({
                    msg: `${checkUnique.name} this type of owner type is Already taken`
                });
            };
            const data = await db.ownerType.updateOne(filterQuery, req.body);
            if (data.modifiedCount) {
                return res.success({
                    result: data,
                    msg: 'owner type Updated Successfully..!'
                })
            };
            return res.clientError({
                msg: 'owner type Update Failed...!'
            });
        } catch (error) {
            errorHandlerFunction(error)
        }
    },
    delete: async (req, res) => {
        try {
            const filterQuery = { _id: req.params.id, isDeleted: false };
            const checkEixst = await db.ownerType.findOne(filterQuery);
            if (!checkEixst) {
                return res.clientError({
                    msg: 'owner type Not Found..!'
                });
            };
            const data = await db.ownerType.updateOne(filterQuery, { isDeleted: true });
            if (data.modifiedCount) {
                return res.success({
                    result: data,
                    msg: 'owner type Deleted Successfully..!'
                })
            };
            return res.clientError({
                msg: 'owner type Delete Failed...!'
            });
        } catch (error) {
            errorHandlerFunction(error)
        }
    },
    status: async (req, res) => {
        try {
            const id = req.params.id
            const data = await db.ownerType.findOne({ _id: id, isDeleted: false })
            if (!data) {
                return res.clientError({
                    msg: "Data not found"
                })
            }

            const status = data.status === 'active' ? 'inactive' : 'active'
            data.status = status
            await data.save()
            return res.success({
                msg: 'owner type status updated',
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
};