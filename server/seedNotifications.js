require('dotenv').config();
const connectDB = require('./configs/db');
const Notification = require('./models/notification.model');
const User = require('./models/user.model');

const seedNotifications = async () => {
  try {
    await connectDB();
    
    // Xóa tất cả thông báo cũ
    await Notification.deleteMany({});
    console.log('Đã xóa thông báo cũ');

    // Lấy một số user để tạo thông báo
    const users = await User.find().limit(10);
    if (users.length === 0) {
      console.log('Không có user nào để tạo thông báo');
      return;
    }

    const sampleNotifications = [
      {
        recipientId: users[0]._id,
        type: 'welcome',
        title: 'Chào mừng bạn đến với KOLP!',
        message: 'Chào mừng bạn đến với nền tảng học tập trực tuyến KOLP. Hãy khám phá các khóa học thú vị!',
        priority: 'low',
        metadata: { userRole: users[0].role }
      },
      {
        recipientId: users[0]._id,
        type: 'course_created',
        title: 'Khóa học mới',
        message: 'Khóa học "React Advanced" đã được thêm vào danh sách',
        priority: 'medium',
        metadata: { courseTitle: 'React Advanced' }
      },
      {
        recipientId: users[0]._id,
        type: 'assignment_submitted',
        title: 'Bài tập mới',
        message: 'Bài tập mới đã được giao trong khóa học "JavaScript Basics"',
        priority: 'medium',
        metadata: { courseTitle: 'JavaScript Basics' }
      }
    ];

    // Tạo thông báo cho mỗi user
    for (const user of users) {
      const userNotifications = sampleNotifications.map(notification => ({
        ...notification,
        recipientId: user._id,
        metadata: { ...notification.metadata, userRole: user.role }
      }));

      await Notification.insertMany(userNotifications);
      console.log(`Đã tạo ${userNotifications.length} thông báo cho user ${user.name}`);
    }

    console.log('Hoàn thành seed notifications!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
