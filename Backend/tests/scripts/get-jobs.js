const mongoose = require('mongoose');
const Job = require('../../src/models/Job');
const User = require('../../src/models/User');

mongoose.connect('mongodb://localhost:27017/find_job')
  .then(async () => {
    const jobs = await Job.find().populate('employer', 'firstName email');
    jobs.forEach(job => {
      console.log(`Job ID: ${job._id}, Title: ${job.title}, Employer: ${job.employer.firstName}`);
    });
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
