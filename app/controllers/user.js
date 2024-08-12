const responseMessages = require('../middlewares/response-messages')
const db = require('../model')
const { errorHandlerFunction, paginationFn } = require('../services/common_service1')
const { bcrypt } = require('../services/imports')
const userModel = db.user
module.exports = {

    createUser: async (req, res) => {
        try {
            const filterArray = [{ mobile: req.body.mobile }]
            if (req.body.email) filterArray.push({ email: req.body.email })

            const checkExists = await userModel.findOne({ isDeleted: false, $or: filterArray })
            if (checkExists) {
                return res.clientError({ msg: responseMessages[1014] })
            }
            const checkRoleExists = await db.role.findOne({ _id: req.body.role, isDeleted: false })
            if (!checkRoleExists) return res.clientError({ msg: 'Invalid Role' })

            const hashedPassword = await bcrypt.hashSync(req.body.password, 8)
            req.body.password = hashedPassword
            req.body.role = checkRoleExists._id.toString()
            req.body.createdBy = req.decoded.user_id
            const data = await userModel.create(req.body)
            if (data && data._id) {
                return res.success({
                    result: data,
                    msg: 'User Created Successfully...!',
                })
            }
            return res.clientError({
                msg: 'User Creation Failed..!',
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    getUser: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false }
            const id = req.params.id
            const { perPage, currentPage, role, search, sortBy } = req.query
            const select = {
                password: 0,
                isDeleted: 0,
                createdAt: 0,
                updatedAt: 0,
            }
            const populateValues = { path: 'role', select: 'name' }
            if (id) {
                filterQuery._id = id
                const data = await userModel.findOne(filterQuery, select).populate(populateValues)
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

            if (role) filterQuery.role = role

            let sort = { createdAt: -1 }
            if (sortBy) {
                if (sortBy === 'latest') {
                    sort = { createdAt: -1 }
                } else if (sortBy === 'oldest') {
                    sort = { createdAt: 1 }
                }
            }

            if (search) {
                const searchRegex = new RegExp(search, 'i')
                const searchCriteria = [
                    { firstName: { $regex: searchRegex } },
                    { lastName: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } },
                    { mobile: { $regex: searchRegex } },
                ]
                filterQuery.$or = searchCriteria
            }
            const { rows, pagination } = await paginationFn(
                res,
                userModel,
                filterQuery,
                perPage,
                currentPage,
                populateValues,
                sort,
                select,
            )
            if (!rows.length) {
                return res.success({
                    msg: responseMessages[1012],
                    result: rows,
                })
            }
            return res.success({
                msg: responseMessages[1008],
                result: { rows, pagination },
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    updateUser: async (req, res) => {
        try {
            const _id = req.params.id
            const filterQuery = { isDeleted: false, _id }
            const checkExists = await userModel.findOne(filterQuery)
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                })
            }
            const filterArray = [{ mobile: req.body.mobile }]
            if (req.body.email) filterArray.push({ email: req.body.email })

            const filter = { isDeleted: false, $or: filterArray }
            const userExists = await userModel.findOne({ _id: { $ne: _id }, $or: filterArray, isDeleted: false })
            if (userExists) {
                return res.clientError({ msg: responseMessages[1014] })
            }

            const updData = req.body
            const data = await userModel.updateOne(filterQuery, updData)
            if (data.modifiedCount) {
                return res.success({
                    result: data,
                    msg: responseMessages[1032],
                })
            }
            return res.clientError({
                msg: responseMessages[1034],
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    deleteUser: async (req, res) => {
        try {
            const _id = req.params.id
            const checkExists = await userModel.findOne({ _id, isDeleted: false })
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                })
            }
            const data = await userModel.updateOne({ _id }, { isDeleted: true })
            if (data.modifiedCount) {
                const title = `Account Deletion Notification From GSB`
                const text = `Dear ${checkExists.name},\n
            I hope this message finds you well. I am writing to inform you that your account has been deleted. 
            This decision was made based on inactivity of your account.\n
            If you have any concerns, please feel free to reach out to our support team.
            Best regards, GSB Team`
                await sendEmail(checkExists.email, title, text)
                return res.success({
                    msg: responseMessages[1015],
                    result: data,
                })
            }
            return res.clientError({
                msg: responseMessages[1016],
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    userStatus: async (req, res) => {
        try {
            const _id = req.params.id
            const filterQuery = { isDeleted: false, _id }
            const findUser = await userModel.findOne(filterQuery)
            if (!findUser) {
                return res.clientError({ msg: responseMessages[1013] })
            }
            const findRole = await db.role.findOne({
                isDeleted: false,
                name: roleNames.ad,
            })
            if (findUser.role.toString() === findRole._id.toString()) {
                return res.clientError({
                    msg: 'Cannot inactive the Admin role..',
                })
            }
            const role = await db.role.findOne({
                _id: findUser.role.toString(),
                isDeleted: false,
            })
            if (role?.status === 'inactive') {
                return res.clientError({
                    msg: `This User Role is in inactive status please active that Role before active this User`,
                })
            }
            const changeStatus = findUser.status === 'active' ? 'inactive' : 'active'
            findUser.status = changeStatus
            let text
            if (findUser.status === 'inactive') {
                text = `Dear ${findUser.name},\n
                    We regret to inform you that Your GSB Membership has been suspended. 
                    for more details please contact Admin.\n
                    Best regards, Team GSB`
            } else if (findUser.status === 'active') {
                text = `Dear ${findUser.name},\n
                    Congratulations!!, Your GSB Membership has been activated successfully.
                    You now have access to exclusive features and content on your website.\n
                    Best regards, Team GSB`
            }
            const subject = 'GSB Membership Status'
            await sendEmail(findUser.email, subject, text)
            await findUser.save()
            return res.success({ msg: responseMessages[1033] })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    pincode: async (req, res) => {
        try {
            const id = req.params.id
            const filter = { stateName: 'TAMIL NADU' }
            const { district, pincode, search } = req.query
            if (id) {
                filter._id = id
                const data = await db.pincode.findOne(filter)
                if (data) {
                    return res.success({
                        msg: 'Location data fetched successfully..!',
                        result: {
                            _id: data._id,
                            areaName: data.officeName.replace(
                                /\s(?:SO|BO|B.O|S.O|S.O.|H.O|S. O|HO)$/,
                                '',
                            ),
                            district: data.district,
                            state: data.stateName,
                            pincode: data.pincode,
                        },
                    })
                }
                return res.clientError({
                    msg: 'Invalid location..!',
                })
            }
            if (search) {
                const searchRegex = new RegExp(search, 'i')
                const searchCriteria = [
                    { stateName: { $regex: searchRegex } },
                    { district: { $regex: searchRegex } },
                    { officeName: { $regex: searchRegex } },
                    { pincode: { $regex: searchRegex } },
                ]
                filter.$or = searchCriteria
            }
            if (pincode) {
                const regex = new RegExp(pincode.replace(/\s/g, ''), 'i')
                filter.pincode = regex
            }
            if (district) {
                const regex = new RegExp(district.toUpperCase().replace(/\s/g, ''), 'i')
                filter.district = regex
            }
            let getData = await db.pincode.find(filter).limit(50)
            console.log(getData.length, 'length----')
            if (getData.length) {
                getData = getData.map((val) => {
                    const capitalize = (value) => {
                        return value.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
                            return a.toUpperCase()
                        })
                    }
                    return {
                        _id: val._id,
                        areaName: capitalize(
                            val.officeName.replace(
                                /\s(?:SO|BO|B.O|S.O|S.O.|H.O|S. O|HO)$/,
                                '',
                            ),
                        ),
                        district: capitalize(val.district),
                        state: capitalize(val.stateName),
                        pincode: val.pincode,
                    }
                })
                return res.success({
                    result: getData,
                    msg: 'Locations fetched successfully',
                })
            }
            return res.clientError({
                msg: 'Invalid location',
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    profileGet: async (req, res) => {
        try {
            const _id = req.params.id || req.decoded.user_id
            const filterQuery = { isDeleted: false }
            filterQuery._id = _id
            const unNecessaryFields = {
                password: 0,
                isDeleted: 0,
                createdAt: 0,
                updatedAt: 0,
            }
            const result = await db.user.findOne(filterQuery, unNecessaryFields).populate('role', 'name')
            if (!result) {
                return res.success({
                    msg: responseMessages[1012],
                })
            }
            return res.success({
                msg: responseMessages[1008],
                result,
            })
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },

}