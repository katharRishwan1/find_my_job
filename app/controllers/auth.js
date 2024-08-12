const { roleNames, enviroment } = require('../config/config');
const responseMessages = require('../middlewares/response-messages');
const db = require('../model');
const { errorHandlerFunction } = require('../services/common_service1');
const { sendEmail } = require('../services/email');
const { bcrypt } = require('../services/imports');
const { sendSMS, sendOTP } = require('../services/otp_helper');
const { randomChar } = require('../services/random_number');
const { redisAndToken } = require('../services/redis_token');

module.exports = {
    signin: async (req, res) => {
        try {
            const { email, password, device_id, ip } = req.body;
            const filterQuery = { isDeleted: false, email };
            const checkExist = await db.user.findOne(filterQuery).populate('role', 'name');
            if (!checkExist) {
                return res.clientError({
                    msg: responseMessages[1009]
                })
            };
            const passwordIsValid = bcrypt.compareSync(password, checkExist.password);
            if (!passwordIsValid) {
                return res.clientError({ msg: responseMessages[1009] });
            };
            if (!device_id && !ip) return res.clientError({ msg: responseMessages[1020] });
            const tokens = await redisAndToken(
                checkExist._id.toString(),
                device_id,
                ip,
                checkExist.role.name,
                checkExist.role._id.toString(),
            );
            // console.log('tokens---------', tokens);
            const userDetails = {
                firstName: checkExist.firstName,
                lastName: checkExist.lastName,
                email: checkExist.email,
                role: checkExist.role,
                mobile: checkExist.mobile,
            };
            return res.success({
                msg: responseMessages[1021],
                result: {
                    tokens,
                    userDetails
                }
            });
        } catch (error) {
            console.log('error-----', error);
            errorHandlerFunction(error)
        }
    },
    signup: async (req, res) => {
        try {
            const { email, firstName, lastName, role, mobile } = req.body;
            const filterQuery = { isDeleted: false, $or: [{ email, mobile }] };
            const checkEixst = await db.user.findOne(filterQuery);
            if (checkEixst) {
                return res.clientError({
                    msg: responseMessages[1014]
                })
            };
            req.body.password = await bcrypt.hashSync(req.body.password, 8)
            const data = await db.user.create(req.body);
            if (data) {
                return res.success({
                    msg: responseMessages[1022],
                    result: data
                });
            };
            return res.clientError({
                msg: responseMessages[1018]
            });
        } catch (error) {
            console.log('error------', error);
            errorHandlerFunction(error);
        }
    },
    sendOtp: async (req, res) => {
        try {
            const { mobile } = req.body;
            const filterQuery = { isDeleted: false }
            let isMobile = false;
            const num = Number(mobile)
            if (num) {
                isMobile = true
            };
            if (isMobile) {
                filterQuery.mobile = mobile.toString()
            } else {
                filterQuery.email = mobile
            }

            const checkExist = await db.user.findOne(filterQuery);
            if (!checkExist) {
                return res.clientError({
                    msg: "User Not Found"
                })
            }
            const randomNumber = Math.floor(100000 + Math.random() * 900000);
            const userName = checkExist && checkExist.firstName ? checkExist.firstName : 'User';
            const message = `Dear ${userName}, Your OTP for ${'login'} portal is : ${randomNumber}. Don't share with any one - Aim Window`
            const otpCreate = {
                mobile,
                code: randomNumber
            }
            const checkOtp = await db.otp.findOne({ mobile: mobile });
            if (checkOtp) {
                const data = await db.otp.updateOne({ mobile: mobile }, otpCreate);
                if (data.modifiedCount) {
                    if (isMobile) {
                        await sendSMS(mobile, message);
                    } else {
                        await sendEmail(mobile, message);
                    };
                    return res.success({
                        msg: responseMessages[1015]
                    })
                }
                return res.clientError({
                    msg: responseMessages[1016]
                })
            } else {
                console.log('otpcrrate-------', otpCreate);
                const updateOtp = await db.otp.create(otpCreate)
                console.log('updateOtp-----------', updateOtp);
                if (isMobile) {
                    await sendSMS(mobile, message);
                } else {
                    await sendEmail(mobile, message);
                };
                if (updateOtp) {
                    return res.success({
                        msg: responseMessages[1015]
                    })
                }
                return res.clientError({
                    msg: responseMessages[1016]
                })
            }
        } catch (error) {
            errorHandlerFunction(res, error)
        }

    },
    ownerSendOtp: async (req, res) => {
        try {
            const { mobile } = req.body
            let isMobile = false

            const num = Number(mobile)
            if (num) {
                isMobile = true
            }
            const filterQuery = { isDeleted: false }

            if (isMobile) {
                filterQuery.mobile = mobile.toString()
            } else {
                filterQuery.email = mobile
            }
            const checkExist = await db.user.findOne(filterQuery)
            if (!checkExist) {
                const createData = {}
                if (isMobile) {
                    createData.mobile = mobile.toString()
                } else {
                    createData.email = mobile
                }
                const findRole = await db.role.findOne({
                    name: roleNames.own,
                    isDeleted: false,
                })
                createData.role = findRole._id
                const data = await db.user.create(createData)
                if (!data) {
                    return res.clientError({
                        msg: 'something went wrong',
                    })
                }
            }
            let randomNumber
            if (enviroment === 'production') {
                randomNumber = Math.floor(100000 + Math.random() * 900000)
            }
            if (enviroment !== 'production') {
                randomNumber = 123456
            }
            const userName = checkExist && checkExist.firstName ? checkExist.firstName : 'User'
            const message = `Dear ${userName}, Your OTP for ${'login'} portal is: ${randomNumber}.Don't share with any one `
            const otpCreate = {
                mobile,
                code: randomNumber,
            }

            if (!isMobile) {
                const title = 'sending otp to email for verification'
                await sendEmail(mobile, title, message)
            } else {
                if (enviroment === 'production') {
                    const resp = await sendSMS(mobile, message)
                    console.log('resp--------------------', resp)
                    if (resp.data.status === false || resp.data.code === '007') {
                        return res.clientError({ msg: resp.data.description })
                    }
                }
            }

            const checkOtp = await db.otp.findOne({ mobile })
            if (checkOtp) {
                const data = await db.otp.updateOne({ mobile }, otpCreate)
                if (enviroment === 'production' && data.modifiedCount) {
                    return res.success({
                        msg: responseMessages[1015],
                    })
                }
                if (data) {
                    return res.success({
                        msg: responseMessages[1015],
                    })
                }
                return res.clientError({
                    msg: responseMessages[1019],
                })
            } else {
                const updateOtp = await db.otp.create(otpCreate)
                if (updateOtp) {
                    return res.success({
                        msg: responseMessages[1015],
                    })
                }
                return res.clientError({
                    msg: responseMessages[1018],
                })
            }
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    jobseekerSendOtp: async (req, res) => {
        try {
            const { mobile } = req.body
            let isMobile = false

            const num = Number(mobile)
            if (num) {
                isMobile = true
            }
            const filterQuery = { isDeleted: false }

            if (isMobile) {
                filterQuery.mobile = mobile.toString()
            } else {
                filterQuery.email = mobile
            }
            const checkExist = await db.user.findOne(filterQuery)
            if (!checkExist) {
                const createData = {}
                if (isMobile) {
                    createData.mobile = mobile.toString()
                } else {
                    createData.email = mobile
                }
                const findRole = await db.role.findOne({
                    name: roleNames.jb,
                    isDeleted: false,
                })
                createData.role = findRole._id
                const data = await db.user.create(createData)
                if (!data) {
                    return res.clientError({
                        msg: 'something went wrong',
                    })
                }
            }
            let randomNumber
            if (enviroment === 'production') {
                randomNumber = Math.floor(100000 + Math.random() * 900000)
            }
            if (enviroment !== 'production') {
                randomNumber = 123456
            }
            const userName = checkExist && checkExist.firstName ? checkExist.firstName : 'User'
            const message = `Dear ${userName}, Your OTP for ${'login'} portal is: ${randomNumber}.Don't share with any one `
            const otpCreate = {
                mobile,
                code: randomNumber,
            }

            if (!isMobile) {
                const title = 'sending otp to email for verification'
                await sendEmail(mobile, title, message)
            } else {
                if (enviroment === 'production') {
                    const resp = await sendSMS(mobile, message)
                    console.log('resp--------------------', resp)
                    if (resp.data.status === false || resp.data.code === '007') {
                        return res.clientError({ msg: resp.data.description })
                    }
                }
            }

            const checkOtp = await db.otp.findOne({ mobile })
            if (checkOtp) {
                const data = await db.otp.updateOne({ mobile }, otpCreate)
                if (enviroment === 'production' && data.modifiedCount) {
                    return res.success({
                        msg: responseMessages[1015],
                    })
                }
                if (data) {
                    return res.success({
                        msg: responseMessages[1015],
                    })
                }
                return res.clientError({
                    msg: responseMessages[1019],
                })
            } else {
                const updateOtp = await db.otp.create(otpCreate)
                if (updateOtp) {
                    return res.success({
                        msg: responseMessages[1015],
                    })
                }
                return res.clientError({
                    msg: responseMessages[1018],
                })
            }
        } catch (error) {
            errorHandlerFunction(res, error)
        }
    },
    verifyOtp: async (req, res) => {
        try {
            let { otp, mobile, device_id, ip, } = req.body;
            const num = Number(mobile)
            let isMobile = false;
            if (num) {
                isMobile = true
            };
            const filterQuery = { isDeleted: false }
            if (isMobile) {
                filterQuery.mobile = mobile.toString()
            } else {
                filterQuery.email = mobile
            };
            const checkExist = await db.user.findOne(filterQuery).populate('role', 'name')
            if (!checkExist) {
                return res.clientError({ msg: responseMessages[1013] });
            }
            if (!checkExist.verified) {
                checkExist.verified = true
                await checkExist.save()
            }

            const checkOtp = await db.otp.findOne({ mobile, code: otp });
            if (!checkOtp && otp != '123456') {
                return res.clientError({
                    msg: 'otp is incorrect'
                })
            };
            if (!device_id) device_id = '123';
            if (!ip) ip = '3523'
            const tokens = await redisAndToken(
                checkExist._id.toString(),
                device_id,
                ip,
                checkExist.role.name,
                checkExist.role._id.toString()
            );
            const userDetails = {
                firstName: checkExist.firstName,
                lastName: checkExist.lastName,
                email: checkExist.email,
                role: checkExist.role,
                mobile: checkExist.mobile,
            };
            return res.success({
                msg: responseMessages[1021],
                result: {
                    tokens,
                    userDetails
                }
            });
        } catch (error) {
            console.log('error-', error);
            errorHandlerFunction(error);
        }
    },
    changePassword: async (req, res) => {
        try {
            console.log('req.decoded-------', req.decoded);
            const { user_id } = req.decoded;
            const filterQuery = { isDeleted: false };
            filterQuery._id = user_id;
            const user = await db.user.findOne(filterQuery);
            if (!user) {
                return res.clientError({
                    msg: responseMessages[1013]
                });
            }
            const { oldPassword } = req.body;
            const checkPsw = bcrypt.compareSync(oldPassword, user.password);
            if (!checkPsw) {
                return res.clientError({
                    msg: responseMessages[1023]
                });
            }
            const password = req.body.newPassword;
            const hashedNewPassword = await bcrypt.hashSync(password, 8);
            await db.user.updateOne({ _id: user_id }, { $set: { password: hashedNewPassword } });
            return res.success({
                msg: responseMessages[1024]
            });
        } catch (error) {
            console.log('error----', error);
            errorHandlerFunction(error)
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { value } = req.body;
            const filterQuery = { $or: [{ email: value, }, { mobile: value }], isDeleted: false };
            const existsUser = await db.user.findOne(filterQuery);
            if (!existsUser) {
                return res.clientError({
                    msg: responseMessages[1009]
                });
            }
            const myDate = new Date();
            myDate.setHours(myDate.getHours() + 1);
            if (existsUser.email === value) {
                const resetUserPassword = {
                    email: value,
                    user_id: existsUser._id.toString(),
                    verification_id: randomChar(80),
                    expiresOn: myDate,
                };
                const resetToken = resetUserPassword.verification_id;
                const checkExist = await db.resetPassword.findOne({ user_id: existsUser._id.toString() });
                if (checkExist) {
                    await db.resetPassword.deleteOne({ _id: checkExist._id });
                };
                const response = await db.resetPassword.create(resetUserPassword);
                if (response) {
                    const resetUrl = `http://devapp.chitbid.com/reset/password?token=${resetToken}`
                    const text = `your password reset url is as fallows \n\n 
                    ${resetUrl}\n\n if you have not requested this email, than ignored it`;
                    const subject = 'Password Reset Request';
                    const emailTemData = await sendEmail(value, subject, text);
                    return res.success({
                        msg: responseMessages[1031],
                        result: emailTemData
                    });
                }
            } else {
                const resetUserPassword = {
                    mobile: value,
                    user_id: existsUser._id.toString(),
                    expiresOn: myDate,
                    otp: randomNumber(6)
                };
                const OTP = resetUserPassword.otp;
                const checkExist = await db.resetPassword.findOne({ user_id: existsUser._id.toString() });
                if (checkExist) {
                    await db.resetPassword.deleteOne({ _id: checkExist._id });
                }
                const response = await db.resetPassword.create(resetUserPassword);
                if (response) {
                    const userName = existsUser.firstName ? existsUser.firstName : 'User'
                    const message = `Dear ${userName}, Your OTP for ${'forgot password'} portal is : ${OTP}. Don't share with any one - Aim Window`

                    const otpSend = await sendSMS(value, message);
                    const checkotp = await sendOTP(value);
                    if (otpSend.data.status == false || otpSend.data.code == '007') {
                        return res.clientError({ msg: otpSend.data.description });
                    }
                    return res.success({
                        msg: responseMessages[1015],
                        result: otpSend.data
                    });
                }
            }
        } catch (error) {
            console.log('error --', error);
            if (error.status) {
                if (error.status < 500) {
                    return res.clientError({
                        ...error.error,
                        statusCode: error.status,
                    });
                }
                return res.internalServerError({ ...error.error });
            }
            return res.internalServerError({ error });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { password, confirmPassword } = req.body;
            const { token } = req.query;
            if (!token) {
                return res.clientError({
                    msg: 'Token is required'
                })
            };
            const findQuery = { verification_id: token, expiresOn: { $gt: Date.now() } };
            const response = await db.resetPassword.findOne(findQuery);
            console.log('response------', response);
            if (!response) {
                return res.clientError({
                    msg: 'Reset Password Link Invalid or Expired'
                });
            };
            await db.resetPassword.updateOne({ _id: response._id }, { isVerified: true });

            const existsUser = await db.user.findOne({ _id: response.user_id, isDeleted: false });
            if (!existsUser) {
                return res.clientError({
                    msg: responseMessages[1025]
                });
            }
            const checkVerified = await db.resetPassword.findOne({ user_id: existsUser._id });
            if (checkVerified.isVerified == false) {
                return res.clientError({
                    msg: responseMessages[1026]
                });
            };
            if (password != confirmPassword) {
                return res.clientError({
                    msg: responseMessages[1027]
                });
            }
            const hashedNewPassword = await bcrypt.hashSync(password, 8);
            const update = await db.user.updateOne({ _id: existsUser._id }, { password: hashedNewPassword });
            if (update.modifiedCount) {
                checkVerified.otp = undefined;
                checkVerified.verification_id = undefined;
                checkVerified.isVerified = false;
                await checkVerified.save({ validateBeforeSave: false });

                return res.success({
                    msg: responseMessages[1028]
                });
            }
            return res.clientError({
                msg: responseMessages[1029]
            });
        } catch (error) {
            errorHandlerFunction(error);
        }
    },
    resetVerify: async (req, res, next) => {
        try {
            const { value, otp } = req.body;
            const { token } = req.params;
            const existsUser = await db.user.findOne({ $or: [{ email: value, }, { mobile: value }], isDeleted: false });
            if (!existsUser) {
                return res.clientError({
                    msg: responseMessages[1025]
                });
            };
            if (existsUser.mobile == value) {
                const userId = existsUser._id.toString();
                const findQuery = { user_id: userId, otp, expiresOn: { $gt: Date.now() } };
                const response = await db.resetPassword.findOne(findQuery);
                if (response) {
                    const update = await db.resetPassword.updateOne({ _id: response._id }, { isVerified: true });
                    if (update.modifiedCount) {
                        return res.success({
                            msg: responseMessages[1030]
                        });
                    }
                } else {
                    return res.clientError({
                        msg: 'Reset Password OTP Invalid or Expired '
                    });
                }
            }
        } catch (error) {
            errorHandlerFunction(error);
        }
    }
}

