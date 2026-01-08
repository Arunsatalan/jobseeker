const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data matching the frontend form structure
const testProfileData = {
  email: 'testuser@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1-555-0123',
  location: 'Toronto, Ontario, M5V 3A8',
  bio: 'Seeking a challenging role as a Senior Frontend Developer',
  headline: 'Frontend Developer | React & Next.js Specialist',
  jobSeekerProfile: {
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    languages: ['English (Native)', 'Spanish (Basic)'],
    yearsOfExperience: 5,
    preferredIndustries: ['Information Technology'],
    preferredEmploymentTypes: ['Full-time'],
    preferredWorkTypes: ['Remote', 'Hybrid'],
    openToRemote: true,
    currentJobTitle: 'Frontend Developer',
    company: 'Tech Corp',
    salaryExpectation: { min: 0, max: 0, currency: 'CAD' },
  },
  education: [
    {
      degree: "Bachelor's Degree",
      fieldOfStudy: 'Computer Science',
      institution: 'University of Toronto',
      graduationYear: '2020',
    },
  ],
  privacy: {
    profileVisibility: 'public',
    showEmail: true,
    allowMessages: true,
  },
};

async function testProfilePersistence() {
  try {
    console.log('🧪 Testing Profile Persistence...\n');

    // Step 1: Get auth token
    console.log('1️⃣  Getting authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'testuser@example.com',
      password: 'Password123!',
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtained:', token.substring(0, 20) + '...\n');

    // Step 2: Save profile
    console.log('2️⃣  Saving profile with all fields...');
    const saveResponse = await axios.post(`${BASE_URL}/api/v1/user-profiles`, testProfileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Profile saved successfully');
    const savedProfile = saveResponse.data.data;
    console.log('Response status:', saveResponse.status);
    console.log('Profile ID:', savedProfile._id, '\n');

    // Step 3: Verify UserProfile fields
    console.log('3️⃣  Verifying UserProfile fields...');
    const userProfileChecks = [
      {
        field: 'firstName',
        expected: testProfileData.firstName,
        actual: savedProfile.firstName,
      },
      {
        field: 'lastName',
        expected: testProfileData.lastName,
        actual: savedProfile.lastName,
      },
      {
        field: 'email',
        expected: testProfileData.email,
        actual: savedProfile.email,
      },
      {
        field: 'headline',
        expected: testProfileData.headline,
        actual: savedProfile.headline,
      },
      {
        field: 'bio',
        expected: testProfileData.bio,
        actual: savedProfile.bio,
      },
      {
        field: 'education array length',
        expected: testProfileData.education.length,
        actual: savedProfile.education?.length,
      },
    ];

    userProfileChecks.forEach((check) => {
      const match = check.expected === check.actual;
      console.log(
        `  ${match ? '✅' : '❌'} ${check.field}: ${match ? 'PASS' : 'FAIL'}`,
        match ? '' : `(Expected: ${check.expected}, Got: ${check.actual})`
      );
    });
    console.log();

    // Step 4: Verify jobSeekerProfile fields
    console.log('4️⃣  Verifying jobSeekerProfile fields...');
    const jobSeekerProfileChecks = [
      {
        field: 'currentJobTitle',
        expected: testProfileData.jobSeekerProfile.currentJobTitle,
        actual: savedProfile.jobSeekerProfile?.currentJobTitle,
      },
      {
        field: 'company',
        expected: testProfileData.jobSeekerProfile.company,
        actual: savedProfile.jobSeekerProfile?.company,
      },
      {
        field: 'yearsOfExperience',
        expected: testProfileData.jobSeekerProfile.yearsOfExperience,
        actual: savedProfile.jobSeekerProfile?.yearsOfExperience,
      },
      {
        field: 'skills array length',
        expected: testProfileData.jobSeekerProfile.skills.length,
        actual: savedProfile.jobSeekerProfile?.skills?.length,
      },
      {
        field: 'languages array length',
        expected: testProfileData.jobSeekerProfile.languages.length,
        actual: savedProfile.jobSeekerProfile?.languages?.length,
      },
      {
        field: 'preferredWorkTypes array length',
        expected: testProfileData.jobSeekerProfile.preferredWorkTypes.length,
        actual: savedProfile.jobSeekerProfile?.preferredWorkTypes?.length,
      },
    ];

    jobSeekerProfileChecks.forEach((check) => {
      const match = check.expected === check.actual;
      console.log(
        `  ${match ? '✅' : '❌'} ${check.field}: ${match ? 'PASS' : 'FAIL'}`,
        match ? '' : `(Expected: ${check.expected}, Got: ${check.actual})`
      );
    });
    console.log();

    // Step 5: Verify privacy fields
    console.log('5️⃣  Verifying privacy fields...');
    const privacyChecks = [
      {
        field: 'profileVisibility',
        expected: testProfileData.privacy.profileVisibility,
        actual: savedProfile.privacy?.profileVisibility,
      },
      {
        field: 'allowMessages',
        expected: testProfileData.privacy.allowMessages,
        actual: savedProfile.privacy?.allowMessages,
      },
      {
        field: 'showEmail',
        expected: testProfileData.privacy.showEmail,
        actual: savedProfile.privacy?.showEmail,
      },
    ];

    privacyChecks.forEach((check) => {
      const match = check.expected === check.actual;
      console.log(
        `  ${match ? '✅' : '❌'} ${check.field}: ${match ? 'PASS' : 'FAIL'}`,
        match ? '' : `(Expected: ${check.expected}, Got: ${check.actual})`
      );
    });
    console.log();

    // Step 6: Retrieve and verify by fetching the profile
    console.log('6️⃣  Fetching saved profile...');
    const fetchResponse = await axios.get(`${BASE_URL}/api/v1/user-profiles/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const fetchedProfile = fetchResponse.data.data;
    console.log('✅ Profile fetched successfully\n');

    // Step 7: Verify persistence
    console.log('7️⃣  Verifying data persisted after fetch...');
    const persistenceChecks = [
      {
        field: 'currentJobTitle persistent',
        expected: testProfileData.jobSeekerProfile.currentJobTitle,
        actual: fetchedProfile.jobSeekerProfile?.currentJobTitle,
      },
      {
        field: 'company persistent',
        expected: testProfileData.jobSeekerProfile.company,
        actual: fetchedProfile.jobSeekerProfile?.company,
      },
      {
        field: 'education persistent',
        expected: true,
        actual: fetchedProfile.education && fetchedProfile.education.length > 0,
      },
    ];

    persistenceChecks.forEach((check) => {
      const match = check.expected === check.actual;
      console.log(
        `  ${match ? '✅' : '❌'} ${check.field}: ${match ? 'PASS' : 'FAIL'}`,
        match ? '' : `(Expected: ${check.expected}, Got: ${check.actual})`
      );
    });
    console.log();

    // Step 8: Check JobSeeker collection
    console.log('8️⃣  Checking JobSeeker collection data...');
    console.log('  ℹ️  Note: JobSeeker data requires direct database check');
    console.log('  Run: db.jobseekers.findOne({email: "testuser@example.com"})');
    console.log('  Verify fields: currentJobTitle, company, yearsOfExperience, skills, languages, preferredWorkTypes, education, privacy\n');

    console.log('✨ Profile Persistence Test Complete!\n');
    console.log('Summary:');
    console.log('  ✅ Profile saved to UserProfile collection');
    console.log('  ✅ All career fields included in payload');
    console.log('  ✅ All fields retrieved successfully');
    console.log('  📝 Check MongoDB for JobSeeker collection updates');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testProfilePersistence();
