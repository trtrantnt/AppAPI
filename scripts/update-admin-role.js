const mongoose = require('mongoose');
const User = require('../schemas/user');
const Role = require('../schemas/role');

const dbUrl = 'mongodb://localhost:27017/your_database_name'; // Thay thế bằng URL MongoDB của bạn

async function updateAdminRole() {
    try {
        await mongoose.connect(dbUrl);
        console.log('Đã kết nối tới cơ sở dữ liệu');

        // Tìm role admin
        const adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
            throw new Error('Không tìm thấy role admin');
        }

        // Cập nhật role cho tài khoản admin01
        const result = await User.updateOne(
            { username: 'admin01' },
            { $set: { role: adminRole._id } }
        );

        if (result.modifiedCount > 0) {
            console.log('Đã cập nhật role cho admin01 thành công!');
        } else {
            console.log('Không tìm thấy user admin01 hoặc không cần cập nhật');
        }

        // Hiển thị thông tin user sau khi cập nhật
        const user = await User.findOne({ username: 'admin01' }).populate('role');
        console.log('Thông tin user sau khi cập nhật:', user);
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        mongoose.connection.close();
    }
}

updateAdminRole();
