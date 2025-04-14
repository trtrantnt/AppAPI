/**
 * Helper để lấy role từ user một cách an toàn
 * bất kể cấu trúc lưu trữ role là gì
 */
module.exports = {
    /**
     * Lấy tên role của user
     * @param {Object} user - Đối tượng user 
     * @returns {String|null} - Tên role hoặc null nếu không tìm thấy
     */
    getUserRole: function(user) {
        if (!user) return null;
        
        // Trường hợp 1: role là một object với thuộc tính name
        if (user.role && typeof user.role === 'object' && user.role.name) {
            return user.role.name;
        }
        
        // Trường hợp 2: role là một chuỗi trực tiếp
        if (user.role && typeof user.role === 'string') {
            return user.role;
        }
        
        // Trường hợp 3: roles là một mảng
        if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
            const role = user.roles[0];
            if (typeof role === 'object' && role.name) {
                return role.name;
            }
            if (typeof role === 'string') {
                return role;
            }
        }
        
        // Trường hợp 4: role có thể là _id object của MongoDB
        if (user.role && typeof user.role === 'object' && user.role._id) {
            // Nếu có trường code, name, hoặc title ưu tiên sử dụng
            return user.role.code || user.role.name || user.role.title || user.role._id.toString();
        }

        // Trường hợp 5: roleId là một chuỗi trực tiếp
        if (user.roleId && typeof user.roleId === 'string') {
            return user.roleId;
        }
        
        console.log('DEBUG - User role structure:', JSON.stringify(user.role || user.roles || {}));
        return null;
    },
    
    /**
     * Kiểm tra xem user có role được yêu cầu hay không
     * @param {Object} user - Đối tượng user
     * @param {Array|String} requiredRoles - Role(s) được yêu cầu
     * @returns {Boolean} - true nếu user có quyền, ngược lại là false
     */
    hasRole: function(user, requiredRoles) {
        const userRole = this.getUserRole(user);
        if (!userRole) {
            console.log('DEBUG - Cannot determine user role');
            return false;
        }
        
        console.log(`DEBUG - User role: ${userRole}, Required roles:`, requiredRoles);
        
        if (Array.isArray(requiredRoles)) {
            return requiredRoles.includes(userRole);
        }
        
        return requiredRoles === userRole;
    },
    
    /**
     * Kiểm tra xem người dùng có nhiều roles hay không
     * @param {Object} user - Đối tượng user
     * @param {Array|String} requiredRoles - Role(s) được yêu cầu
     * @returns {Boolean} - true nếu user có một trong các quyền, ngược lại là false
     */
    hasAnyRole: function(user, requiredRoles) {
        // Trường hợp đặc biệt: nếu user có role "admin", luôn cho phép
        const userRole = this.getUserRole(user);
        if (userRole === "admin") return true;
        
        if (!Array.isArray(requiredRoles)) {
            requiredRoles = [requiredRoles];
        }
        
        return this.hasRole(user, requiredRoles);
    }
};
