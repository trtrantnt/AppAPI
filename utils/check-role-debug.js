const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
const constants = require('./constants');

/**
 * Giải mã token và hiển thị thông tin role
 * @param {string} token - JWT token
 */
async function debugUserRole(token) {
    try {
        // Loại bỏ tiền tố "Bearer " nếu có
        if (token.startsWith('Bearer ')) {
            token = token.slice(7);
        }
        
        // Giải mã token
        const decoded = jwt.verify(token, constants.SECRET_KEY);
        console.log('Thông tin giải mã từ token:', decoded);
        
        // Tìm user trong database
        const user = await User.findById(decoded.id).populate('role');
        
        console.log('Thông tin user từ database:');
        console.log(`ID: ${user._id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Role ID: ${user.role?._id}`);
        console.log(`Role name: ${user.role?.name}`);
        
        // Kiểm tra vai trò admin
        const isAdmin = user.role?.name === 'admin';
        console.log(`Người dùng ${isAdmin ? 'CÓ' : 'KHÔNG CÓ'} quyền admin`);
        
        return {
            user,
            isAdmin
        };
    } catch (error) {
        console.error('Lỗi khi giải mã token:', error.message);
        return null;
    }
}

module.exports = { debugUserRole };

// Sử dụng trực tiếp khi script được chạy độc lập
if (require.main === module) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    readline.question('Nhập JWT token của bạn: ', async (token) => {
        const mongoose = require('mongoose');
        const dbUrl = 'mongodb://localhost:27017/your_database_name'; // Thay đổi theo cấu hình của bạn
        
        try {
            await mongoose.connect(dbUrl);
            await debugUserRole(token);
        } catch (error) {
            console.error('Lỗi:', error);
        } finally {
            mongoose.connection.close();
            readline.close();
        }
    });
}
