const responseMessages = require('./response-messages');
const { verifyAccessToken } = require('../services/jwt_helper');
const config = require('../config/config');

module.exports = {
    checkSetToken: () => async (req, res, next) => {
        console.log('token checking-----------');
        const ignorePaths = ['auth', 'otp', 'portal', 'webhook', 'signup', 'signin', 'favicon.ico', 'forgot', 'reset',];
        const getRouteStart = req.url.split('/');
        if (ignorePaths.includes(getRouteStart[1])) {
            return next();
        }
        let token = req.headers.Authorization || req.headers.authorization;
        if (token) {
            token = token.substr('Bearer '.length);
            try {
                const decoded = await verifyAccessToken(token);
                console.log('decpded--------', decoded);
                if (decoded) {
                    req.decoded = decoded;
                    return next()
                }
                return res.unauthorized({ msg: responseMessages[1001] });
                // const foundDeviceToken = await collectTokens(decoded.user_id, decoded.device_id, decoded.ip);
                // if (foundDeviceToken === REDIS_SERVER_NOT_CONNECTED) {
                //     return res.serverError({ msg: responseMessages[1002] });
                // }
                // if (foundDeviceToken.length) {
                //     req.decoded = decoded;
                //     return next();
                // }
                return res.serverError({ msg: responseMessages[1002] });
            } catch (error) {
                return res.unauthorized({ msg: responseMessages[1003] });
            }
        } else {
            return res.unauthorized({ msg: responseMessages[1004] });
        }
    },
    checkAddUrlToHit: (baseUrlToAppend) => (req, res, next) => {
        req.hitUrl = baseUrlToAppend + req.url;
        console.log(baseUrlToAppend, req.hitUrl);
        return next();
    },
    checkRoles:
        (allowedRolesShortNames = []) =>
            async (req, res, next) => {
                try {
                    const allowedRoles = allowedRolesShortNames.map((roleShortName) => config.roleNames[roleShortName] || {});
                    console.log('allowedRoles', allowedRoles, req.decoded.roleType);
                    const roleAllowed = allowedRoles.includes(req.decoded.roleType);
                    if (roleAllowed) {
                        return next();
                    }
                    return res.unauthorized({ msg: responseMessages[1005] });
                } catch (error) {
                    console.log('\n role check error...', error);
                    return res.unauthorized({ msg: responseMessages[1006] });
                }
            },
};
