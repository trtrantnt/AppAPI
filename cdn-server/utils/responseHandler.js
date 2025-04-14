module.exports = {
    CreateSuccessResponse: function (res, status, data) {
        res.status(status).send({
            success: true,
            data: data
        });
    }, CreateErrorResponse: function (res, status, message) {
        res.status(status).send({
            success: false,
            message: message
        });
    },
    CreateCookieResponse: function (res,key,value,exp) {
        res.cookie(key, value, {
            httpOnly: true,
            expires: new Date(exp),
            signed: true
        });
    },
    // Thêm hàm mới để format phản hồi API cho trang quản trị
    CreateAdminResponse: function(res, status, data, message = null, totalItems = null, pagination = null) {
        let response = {
            success: status < 400,
            data: data
        };
        
        if (message) {
            response.message = message;
        }
        
        if (totalItems !== null) {
            response.total = totalItems;
        }
        
        if (pagination) {
            response.pagination = pagination;
        }
        
        res.status(status).send(response);
    }
}