const router = require('express').Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const userProfileRoutes = require('./userProfileRoutes');
const jobRoutes = require('./jobRoutes');
const categoryRoutes = require('./categoryRoutes');
const applicationRoutes = require('./applicationRoutes');
const resumeRoutes = require('./resumeRoutes');
const messageRoutes = require('./messageRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const companyRoutes = require('./companyRoutes');
const jobSeekerPreferencesRoutes = require('./jobSeekerPreferencesRoutes');
const cvRoutes = require('./cvRoutes');
const aiRoutes = require('./aiRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/user-profiles', userProfileRoutes);
router.use('/cv', cvRoutes);
router.use('/jobs', jobRoutes);
router.use('/categories', categoryRoutes);
router.use('/applications', applicationRoutes);
router.use('/resumes', resumeRoutes);
router.use('/messages', messageRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/companies', companyRoutes);
router.use('/jobseeker', jobSeekerPreferencesRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
