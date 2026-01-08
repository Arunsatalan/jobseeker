const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Notification = require('../../src/models/Notification');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check admin user
    const admin = await User.findById('6946b002859a8552ae42c37a');
    console.log('🔍 ADMIN USER:');
    if (admin) {
      console.log(`- ID: ${admin._id}`);
      console.log(`- Email: ${admin.email}`);
      console.log(`- Role: ${admin.role}`);
      console.log(`- Name: ${admin.firstName} ${admin.lastName}\n`);
    } else {
      console.log('❌ Admin user not found\n');
    }
    
    // Check all notifications for this admin
    const notifications = await Notification.find({ userId: '6946b002859a8552ae42c37a' });
    console.log(`📧 NOTIFICATIONS FOR ADMIN: ${notifications.length}`);
    
    notifications.forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Read: ${notif.isRead}`);
      console.log(`   Created: ${notif.createdAt}`);
      console.log(`   User ID: ${notif.userId}`);
    });
    
    // Test the API query directly
    console.log('\n🧪 TESTING API QUERY:');
    const apiResult = await Notification.find({ userId: new mongoose.Types.ObjectId('6946b002859a8552ae42c37a') })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`API Query Result: ${apiResult.length} notifications`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabase();