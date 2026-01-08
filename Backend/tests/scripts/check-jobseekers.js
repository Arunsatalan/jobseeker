const mongoose = require('mongoose');
const User = require('../../src/models/User');
const JobSeeker = require('../../src/models/JobSeeker');
const JobSeekerPreferences = require('../../src/models/JobSeekerPreferences');

mongoose.connect('mongodb://localhost:27017/find_job')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Find all JobSeeker records
    const jobSeekers = await JobSeeker.find().populate('user', 'firstName lastName email');
    
    console.log(`Found ${jobSeekers.length} JobSeeker records:\n`);
    
    for (const js of jobSeekers) {
      console.log(`👤 ${js.user?.firstName} ${js.user?.lastName} (${js.user?.email})`);
      console.log(`   JobSeeker ID: ${js._id}`);
      
      const prefs = await JobSeekerPreferences.findOne({ jobSeeker: js._id });
      if (prefs) {
        console.log(`   ✅ Has preferences: ${prefs.desiredRoles?.join(', ')}`);
      } else {
        console.log(`   ❌ No preferences`);
      }
      console.log();
    }

    if (jobSeekers.length === 0) {
      console.log('Creating sample JobSeeker with preferences...\n');
      
      // Find or create a job seeker user
      let user = await User.findOne({ role: 'jobseeker', email: 'test@jobseeker.com' });
      if (!user) {
        const bcrypt = require('bcryptjs');
        user = await User.create({
          firstName: 'Test',
          lastName: 'JobSeeker',
          email: 'test@jobseeker.com',
          password: await bcrypt.hash('Test123!', 10),
          role: 'jobseeker',
          isEmailVerified: true
        });
      }

      const jobSeeker = await JobSeeker.create({
        user: user._id,
        firstName: 'Test',
        lastName: 'JobSeeker',
        email: 'test@jobseeker.com',
        city: 'Toronto',
        province: 'Ontario',
        skills: ['MongoDB', 'Docker', 'AWS', 'Python'],
        headline: 'Backend Developer with cloud experience',
        yearsOfExperience: 3
      });

      const preferences = await JobSeekerPreferences.create({
        jobSeeker: jobSeeker._id,
        desiredRoles: ['backend', 'software engineer'],
        locations: ['canada'],
        salaryMin: 60000,
        salaryMax: 100000,
        salaryPeriod: 'yearly',
        experienceLevel: 'Mid-level',
        workType: ['Full-time', 'Contract', 'Remote', 'Hybrid'],
        availability: 'Immediately',
        profileVisible: true
      });

      console.log('✅ Created:');
      console.log(`   User: ${user.email} (${user._id})`);
      console.log(`   JobSeeker: ${jobSeeker._id}`);
      console.log(`   Preferences: ${preferences._id}`);
      console.log(`\n🔑 Login with: test@jobseeker.com / Test123!`);
    }

    process.exit(0);
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  });
