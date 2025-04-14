var userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')

module.exports = {
    check_authentication: function (req, res, next) {
        try {
            // Extract token from headers
            const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication token missing'
                });
            }
            
            const decoded = jwt.verify(token, constants.SECRET_KEY);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed'
            });
        }
    },

    // Make sure optional authentication doesn't block requests
    check_authentication_optional: function (req, res, next) {
        try {
            let authorization = req.headers.authorization;
            if (authorization) {
                let token = authorization.split(" ")[1];
                let decode = jwt.verify(token, constants.SECRET_KEY);
                req.user = decode;
            }
            // Always proceed, whether authenticated or not
            next();
        } catch (error) {
            // Just proceed without authentication
            console.log("Optional authentication failed:", error.message);
            next();
        }
    },

    check_authorization: function (requiredRole) {
        return function (req, res, next) {
            let userRole = req.user.role.name;
            if (!requiredRole.includes(userRole)) {
                next(new Error("ban khong co quyen"));
            } else {
                next()
            }
        }
    }
}