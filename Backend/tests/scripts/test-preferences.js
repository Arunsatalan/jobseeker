const mongoose = require('mongoose');
const User = require('../../src/models/User');
const JobSeeker = require('../../src/models/JobSeeker');
const JobSeekerPreferences = require('../../src/models/JobSeekerPreferences');

mongoose.connect('mongodb://localhost:27017/find_job')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Find a user
    const users = await User.find({ role: 'jobseeker' }).limit(1);
    if (users.length === 0) {
      console.log('❌ No job seeker users found');
      process.exit(0);
    }

    const user = users[0];
    console.log(`👤 User: ${user.firstName} ${user.lastName} (${user._id})\n`);

    // Find JobSeeker
    const jobSeeker = await JobSeeker.findOne({ user: user._id });
    if (!jobSeeker) {
      console.log('❌ No JobSeeker record found for this user');
      process.exit(0);
    }
    console.log(`💼 JobSeeker ID: ${jobSeeker._id}`);
    console.log(`   Skills: ${jobSeeker.skills?.join(', ') || 'None'}\n`);

    // Find JobSeekerPreferences
    const preferences = await JobSeekerPreferences.findOne({ jobSeeker: jobSeeker._id });
    if (!preferences) {
      console.log('❌ No JobSeekerPreferences found for this JobSeeker');
      console.log('\n📋 Creating sample preferences...');
      
      const newPrefs = await JobSeekerPreferences.create({
        jobSeeker: jobSeeker._id,
        desiredRoles: ['backend', 'software engineer'],
        locations: ['canada'],
        salaryMin: 60000,
        salaryMax: 100000,
        salaryPeriod: 'yearly',
        experienceLevel: 'Mid-level',
        workType: ['Full-time', 'Contract', 'Remote', 'Hybrid'],
        availability: 'Immediately',
        profileVisible: false
      });
      
      console.log('✅ Sample preferences created!');
      console.log(JSON.stringify(newPrefs, null, 2));
    } else {
      console.log('✅ JobSeekerPreferences found:');
      console.log(`   ID: ${preferences._id}`);
      console.log(`   Desired Roles: ${preferences.desiredRoles?.join(', ') || 'None'}`);
      console.log(`   Locations: ${preferences.locations?.join(', ') || 'None'}`);
      console.log(`   Experience: ${preferences.experienceLevel || 'None'}`);
      console.log(`   Salary: $${preferences.salaryMin || 0} - $${preferences.salaryMax || 0} ${preferences.salaryPeriod || 'yearly'}`);
      console.log(`   Work Types: ${preferences.workType?.join(', ') || 'None'}`);
      console.log(`   Availability: ${preferences.availability || 'None'}`);
    }

    process.exit(0);
  })
  .catch(e => {
    console.error('❌ Database Error:', e.message);
    process.exit(1);
  });
