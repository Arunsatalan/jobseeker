const mongoose = require('mongoose');
const aiController = require('../../src/controllers/aiController');
const Job = require('../../src/models/Job');
const User = require('../../src/models/User');

mongoose.connect('mongodb://localhost:27017/find_job')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Get test user
    const user = await User.findOne({ email: 'test@jobseeker.com' });
    if (!user) {
      console.log('❌ Test user not found. Run check-jobseekers.js first');
      process.exit(1);
    }

    // Get a job
    const job = await Job.findOne().populate('company');
    if (!job) {
      console.log('❌ No jobs found. Run seed script first');
      process.exit(1);
    }

    console.log(`Testing AI analysis for: ${user.firstName} ${user.lastName}`);
    console.log(`Job: ${job.title} at ${job.company?.name}\n`);

    // Mock request and response
    const req = {
      user: { _id: user._id },
      body: {
        jobId: job._id,
        userProfile: null // Let it fetch from DB
      }
    };

    const res = {
      status: (code) => res,
      json: (data) => {
        console.log('📊 AI Analysis Result:\n');
        console.log(JSON.stringify(data, null, 2));
        process.exit(0);
      }
    };

    const next = (err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    };

    // Call the controller
    await aiController.analyzeProfile(req, res, next);
  })
  .catch(e => {
    console.error('❌ Database Error:', e.message);
    process.exit(1);
  });
