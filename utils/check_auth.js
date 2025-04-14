var userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let userModel = require('../schemas/user')
let roleHelper = require('./role-helper')

module.exports = {
    check_authentication: async function (req, res, next) {
        try {
            let authorization = req.header('Authorization')
            if (!authorization) {
                throw new Error("Vui long dang nhap")
            } else {
                let token = authorization.split(" ")[1]
                let decode = jwt.verify(token, constants.SECRET_KEY)
                
                // Lấy thông tin user và populate role
                const user = await userModel.findById(decode.id).populate('role');
                if (!user) {
                    throw new Error("User không tồn tại");
                }
                
                req.user = user; // gán user đã populate role
                next();
            }
        } catch (error) {
            next(error)
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
            if (!req.user) {
                return next(new Error("Vui lòng đăng nhập"));
            }
            
            if (roleHelper.hasRole(req.user, requiredRole)) {
                next();
            } else {
                next(new Error("Bạn không có quyền thực hiện chức năng này"));
            }
        }
    }
}