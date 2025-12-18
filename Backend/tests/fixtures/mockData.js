module.exports = {
  mockUsers: [
    {
      firstName: 'John',
      lastName: 'Developer',
      email: 'john@test.com',
      password: 'TestPass123!',
      role: 'jobseeker',
      location: 'Toronto, ON',
    },
  ],
  mockJobs: [
    {
      title: 'Software Engineer',
      description: 'Join our development team',
      company: 'Tech Corp',
      location: 'Toronto, ON',
      employmentType: 'full-time',
      experience: 'mid',
      salaryMin: 80000,
      salaryMax: 120000,
      skills: ['JavaScript', 'React'],
    },
  ],
  mockApplications: [
    {
      status: 'applied',
      coverLetter: 'I am interested in this position',
    },
  ],
};
