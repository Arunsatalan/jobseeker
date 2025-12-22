require('dotenv').config();
const mongoose = require('mongoose');
const UserProfile = require('./src/models/UserProfile');
const JobSeeker = require('./src/models/JobSeeker');

async function checkUserData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/canadajobs');
    console.log('✅ Connected to MongoDB\n');

    const email = 'satalanarun2000@gmail.com';
    
    // Check UserProfile
    console.log('📋 Checking UserProfile Collection...\n');
    const userProfile = await UserProfile.findOne({ email }).lean();
    
    if (userProfile) {
      console.log('✅ UserProfile found');
      console.log('First Name:', userProfile.firstName);
      console.log('Last Name:', userProfile.lastName);
      console.log('Headline:', userProfile.headline);
      console.log('Bio:', userProfile.bio);
      console.log('Education:', userProfile.education ? `${userProfile.education.length} entries` : 'None');
      if (userProfile.education && userProfile.education.length > 0) {
        userProfile.education.forEach((edu, idx) => {
          console.log(`  ${idx + 1}. ${edu.degree} in ${edu.fieldOfStudy} (${edu.institution}, ${edu.graduationYear})`);
        });
      }
      console.log('Privacy/Visibility:');
      console.log('  - profileVisibility:', userProfile.privacy?.profileVisibility);
      console.log('  - allowMessages:', userProfile.privacy?.allowMessages);
      console.log('  - showEmail:', userProfile.privacy?.showEmail);
      console.log('jobSeekerProfile:', userProfile.jobSeekerProfile ? 'Present' : 'Not found');
      if (userProfile.jobSeekerProfile) {
        console.log('  - skills:', userProfile.jobSeekerProfile.skills?.length || 0, 'skills');
        console.log('  - languages:', userProfile.jobSeekerProfile.languages?.length || 0, 'languages');
        console.log('  - yearsOfExperience:', userProfile.jobSeekerProfile.yearsOfExperience);
        console.log('  - preferredWorkTypes:', userProfile.jobSeekerProfile.preferredWorkTypes);
      }
    } else {
      console.log('❌ UserProfile not found');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Check JobSeeker
    console.log('📋 Checking JobSeeker Collection...\n');
    const jobSeeker = await JobSeeker.findOne({ email }).lean();
    
    if (jobSeeker) {
      console.log('✅ JobSeeker found');
      console.log('First Name:', jobSeeker.firstName);
      console.log('Last Name:', jobSeeker.lastName);
      console.log('Email:', jobSeeker.email);
      console.log('Phone:', jobSeeker.phone);
      console.log('City:', jobSeeker.city);
      console.log('Province:', jobSeeker.province);
      console.log('Headline:', jobSeeker.headline);
      console.log('Current Job Title:', jobSeeker.currentJobTitle);
      console.log('Company:', jobSeeker.company);
      console.log('Industry:', jobSeeker.industry);
      console.log('Years of Experience:', jobSeeker.yearsOfExperience);
      console.log('Skills:', jobSeeker.skills?.length || 0, 'skills');
      if (jobSeeker.skills && jobSeeker.skills.length > 0) {
        jobSeeker.skills.forEach(skill => console.log(`  - ${skill}`));
      }
      console.log('Languages:', jobSeeker.languages?.length || 0, 'languages');
      if (jobSeeker.languages && jobSeeker.languages.length > 0) {
        jobSeeker.languages.forEach(lang => console.log(`  - ${lang}`));
      }
      console.log('Preferred Work Types:', jobSeeker.preferredWorkTypes || 'None');
      console.log('Open to Remote:', jobSeeker.openToRemote);
      console.log('Education:', jobSeeker.education ? `${Array.isArray(jobSeeker.education) ? jobSeeker.education.length : 1} entries` : 'None');
      if (jobSeeker.education) {
        if (Array.isArray(jobSeeker.education)) {
          jobSeeker.education.forEach((edu, idx) => {
            console.log(`  ${idx + 1}. ${edu.degree} in ${edu.fieldOfStudy} (${edu.institution}, ${edu.graduationYear})`);
          });
        } else {
          console.log('  -', jobSeeker.education);
        }
      }
      console.log('Privacy Settings:');
      console.log('  - profileVisibility:', jobSeeker.privacy?.profileVisibility);
      console.log('  - allowMessages:', jobSeeker.privacy?.allowMessages);
      console.log('  - showEmail:', jobSeeker.privacy?.showEmail);
      console.log('  - showPhone:', jobSeeker.privacy?.showPhone);
    } else {
      console.log('❌ JobSeeker not found');
    }

    console.log('\n✨ Data verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserData();
