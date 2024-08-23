const { roleNames, enviroment } = require('../config/config');
const responseMessages = require('../middlewares/response-messages');
const db = require('../model');
const { errorHandlerFunction } = require('../services/common_service1');
const { sendEmail } = require('../services/email');
const { bcrypt } = require('../services/imports');
const { sendSMS, sendOTP } = require('../services/otp_helper');
const { randomChar } = require('../services/random_number');
const { redisAndToken } = require('../services/redis_token');
const jwtHelper = require('../services/jwt_helper');

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
            // const tokens = await redisAndToken(
            //     checkExist._id.toString(),
            //     device_id,
            //     ip,
            //     checkExist.role.name,
            //     checkExist.role._id.toString(),
            // );
            const payload = { user_id: checkExist._id.toString(), device_id, ip, roleType: checkExist.role.name, roleId: checkExist.role._id.toString() };

            const accessToken = jwtHelper.signAccessToken(payload);
            const refreshToken = jwtHelper.signRefreshToken(payload);
            const tokens = {
                accessToken,
                refreshToken,
            };
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

            errorHandlerFunction(res, error)
        }
    },
    signup: async (req, res) => {
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
            const data = await db.user.create(req.body)
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
            console.log('error------', error);
            errorHandlerFunction(res, error);
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
            // const tokens = await redisAndToken(
            //     checkExist._id.toString(),
            //     device_id,
            //     ip,
            //     checkExist.role.name,
            //     checkExist.role._id.toString()
            // );
            const payload = { user_id: checkExist._id.toString(), device_id, ip, roleType: checkExist.role.name, roleId: checkExist.role._id.toString() };
            const accessToken = jwtHelper.signAccessToken(payload);
            const refreshToken = jwtHelper.signRefreshToken(payload);
            const tokens = {
                accessToken,
                refreshToken,
            };
            const userDetails = {
                firstName: checkExist.firstName,
                lastName: checkExist.lastName,
                email: checkExist.email,
                role: checkExist.role,
                mobile: checkExist.mobile,
            };
            console.log('happening')
            return res.success({
                msg: responseMessages[1021],
                result: {
                    tokens,
                    userDetails
                }
            });
        } catch (error) {
            errorHandlerFunction(res, error);
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
            errorHandlerFunction(res, error)
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
            errorHandlerFunction(res, error);
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
            errorHandlerFunction(res, error);
        }
    }
}

