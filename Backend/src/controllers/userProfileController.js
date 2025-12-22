const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const Company = require('../models/Company');
const JobSeeker = require('../models/JobSeeker');
const catchAsync = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc Get user profile by user ID
// @route GET /api/v1/user-profiles/:userId
// @access Private
exports.getUserProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Check if user is requesting their own profile or is admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this profile', 403));
  }

  let userProfile = await UserProfile.findOne({ userId }).populate('userId', 'email firstName lastName phone role');

  if (!userProfile) {
    // Create a new profile if it doesn't exist
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    userProfile = await UserProfile.create({
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      location: user.location,
      role: user.role,
      profilePhoto: user.profilePhoto,
    });

    userProfile = await userProfile.populate('userId', 'email firstName lastName phone role');
  }

  res.status(200).json({
    success: true,
    data: userProfile,
  });
});

// @desc Get current user profile
// @route GET /api/v1/user-profiles/me
// @access Private
exports.getMyProfile = catchAsync(async (req, res, next) => {
  let userProfile = await UserProfile.findOne({ userId: req.user.id }).populate('userId', 'email firstName lastName phone role');

  if (!userProfile) {
    // Create a new profile if it doesn't exist
    userProfile = await UserProfile.create({
      userId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      location: req.user.location,
      role: req.user.role,
      profilePhoto: req.user.profilePhoto,
    });

    userProfile = await userProfile.populate('userId', 'email firstName lastName phone role');
  }

  res.status(200).json({
    success: true,
    data: userProfile,
  });
});

// @desc Create or update user profile
// @route POST /api/v1/user-profiles
// @access Private
exports.createOrUpdateProfile = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, phone, location, bio, headline, profilePhoto, role, socialLinks, jobSeekerProfile, employerProfile, privacy, notifications, education } = req.body;

  // Find or create UserProfile
  let userProfile = await UserProfile.findOne({ userId: req.user.id });

  if (!userProfile) {
    userProfile = new UserProfile({
      userId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
    });
  }

  // Update UserProfile fields
  if (email) userProfile.email = email;
  if (firstName) userProfile.firstName = firstName;
  if (lastName) userProfile.lastName = lastName;
  if (phone) userProfile.phone = phone;
  if (location) userProfile.location = location;
  if (bio) userProfile.bio = bio;
  if (headline) userProfile.headline = headline;
  if (profilePhoto) userProfile.profilePhoto = profilePhoto;
  if (socialLinks) userProfile.socialLinks = { ...userProfile.socialLinks, ...socialLinks };
  if (jobSeekerProfile) userProfile.jobSeekerProfile = { ...userProfile.jobSeekerProfile, ...jobSeekerProfile };
  if (employerProfile) userProfile.employerProfile = { ...userProfile.employerProfile, ...employerProfile };
  if (privacy) userProfile.privacy = { ...userProfile.privacy, ...privacy };
  if (notifications) userProfile.notifications = { ...userProfile.notifications, ...notifications };
  if (education) userProfile.education = education;

  // Calculate profile completion percentage
  const completedFields = [];
  if (userProfile.firstName) completedFields.push('firstName');
  if (userProfile.lastName) completedFields.push('lastName');
  if (userProfile.phone) completedFields.push('phone');
  if (userProfile.location) completedFields.push('location');
  if (userProfile.bio) completedFields.push('bio');
  if (userProfile.profilePhoto?.url) completedFields.push('profilePhoto');
  if (userProfile.role === 'employer' && userProfile.employerProfile?.companyName) completedFields.push('companyName');
  if (userProfile.role === 'employer' && userProfile.employerProfile?.companyDescription) completedFields.push('companyDescription');
  if (userProfile.role === 'jobseeker' && userProfile.jobSeekerProfile?.skills?.length > 0) completedFields.push('skills');

  userProfile.profileCompletion = {
    percentage: Math.round((completedFields.length / 10) * 100),
    completedFields,
    lastUpdatedField: 'profile',
    lastUpdatedDate: new Date(),
  };

  await userProfile.save();

  // Also save to JobSeeker model if role is jobseeker
  if (req.user.role === 'jobseeker' && jobSeekerProfile) {
    let jobSeeker = await JobSeeker.findOne({ user: req.user.id });

    if (!jobSeeker) {
      jobSeeker = new JobSeeker({
        user: req.user.id,
        email: email || req.user.email,
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        phone: phone || req.user.phone,
      });
    }

    // Extract location parts
    const locationParts = location?.split(', ') || [];
    if (locationParts.length >= 2) {
      jobSeeker.city = locationParts[0];
      jobSeeker.province = locationParts[1];
    }

    // Update basic info
    if (firstName) jobSeeker.firstName = firstName;
    if (lastName) jobSeeker.lastName = lastName;
    if (email) jobSeeker.email = email;
    if (phone) jobSeeker.phone = phone;

    // Update career information
    if (headline) jobSeeker.headline = headline;
    if (jobSeekerProfile.skills) jobSeeker.skills = jobSeekerProfile.skills;
    if (jobSeekerProfile.languages) jobSeeker.languages = jobSeekerProfile.languages;
    if (jobSeekerProfile.experience) jobSeeker.experience = jobSeekerProfile.experience;
    if (education && Array.isArray(education)) jobSeeker.education = education;
    if (jobSeekerProfile.yearsOfExperience) jobSeeker.yearsOfExperience = jobSeekerProfile.yearsOfExperience;
    if (jobSeekerProfile.preferredIndustries && jobSeekerProfile.preferredIndustries[0]) {
      jobSeeker.industry = jobSeekerProfile.preferredIndustries[0];
    }
    if (jobSeekerProfile.currentJobTitle) jobSeeker.currentJobTitle = jobSeekerProfile.currentJobTitle;
    if (jobSeekerProfile.company) jobSeeker.company = jobSeekerProfile.company;
    if (jobSeekerProfile.openToRemote !== undefined) jobSeeker.openToRemote = jobSeekerProfile.openToRemote;
    if (jobSeekerProfile.preferredEmploymentTypes) jobSeeker.preferredWorkTypes = jobSeekerProfile.preferredEmploymentTypes;
    if (jobSeekerProfile.preferredWorkTypes) jobSeeker.preferredWorkTypes = jobSeekerProfile.preferredWorkTypes;

    // Update privacy settings
    if (privacy) {
      jobSeeker.privacy = { ...jobSeeker.privacy, ...privacy };
    }

    await jobSeeker.save();
  }

  res.status(200).json({
    success: true,
    data: userProfile,
    message: 'Profile updated successfully',
  });
});

// @desc Update employer profile details
// @route PUT /api/v1/user-profiles/employer/details
// @access Private
exports.updateEmployerProfile = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'employer') {
    return next(new ErrorResponse('Only employers can update employer profile', 403));
  }

  const { companyName, industry, companySize, companyWebsite, companyDescription, companyLogo, socialLinks, email } = req.body;

  let userProfile = await UserProfile.findOne({ userId: req.user.id });
  let user = await User.findById(req.user.id);

  // Update User email if provided and different
  if (email && email !== user.email) {
    // Check if email is already taken
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new ErrorResponse('Email already in use', 400));
    }
    user.email = email;
    await user.save({ validateBeforeSave: false });
  }

  if (!userProfile) {
    userProfile = new UserProfile({
      userId: req.user.id,
      email: user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: 'employer',
      employerProfile: {
        companyName: '',
        industry: '',
        companySize: '',
        companyWebsite: '',
        companyDescription: '',
        companyLogo: {
          url: null,
          publicId: null,
        },
      },
    });
  } else {
    // Sync email to profile
    if (email) userProfile.email = email;
  }

  // Ensure employerProfile exists before updating
  if (!userProfile.employerProfile) {
    userProfile.employerProfile = {
      companyName: '',
      industry: '',
      companySize: '',
      companyWebsite: '',
      companyDescription: '',
      companyLogo: {
        url: null,
        publicId: null,
      },
    };
  }

  // Update employer-specific fields in UserProfile
  // Only include provided values, keep existing ones for unprovided fields
  if (companyName !== undefined) userProfile.employerProfile.companyName = companyName;
  if (industry !== undefined) userProfile.employerProfile.industry = industry;
  if (companySize !== undefined) userProfile.employerProfile.companySize = companySize;
  if (companyWebsite !== undefined) userProfile.employerProfile.companyWebsite = companyWebsite;
  if (companyDescription !== undefined) userProfile.employerProfile.companyDescription = companyDescription;

  // Handle companyLogo - only set if provided with a valid URL
  if (companyLogo && companyLogo.url) {
    userProfile.employerProfile.companyLogo = {
      url: companyLogo.url,
      publicId: companyLogo.publicId || null,
    };
  }

  if (socialLinks) {
    userProfile.socialLinks = {
      ...userProfile.socialLinks,
      ...socialLinks,
    };
  }

  // Update Company model if associated
  if (user.company) {
    const company = await Company.findById(user.company);
    if (company) {
      if (companyName) company.name = companyName;
      if (email) company.email = email;
      // Also update other common fields if they exist in request
      // We need to map frontend fields to Company model fields
      if (companyWebsite !== undefined) company.website = companyWebsite;
      if (industry !== undefined) company.industry = industry;
      if (companySize !== undefined) company.size = companySize;
      if (companyDescription !== undefined) company.description = companyDescription;
      // We are getting location from user profile for now, but company model has location too. 
      // Assuming location isn't passed in this specific endpoint based on code, but if it was, we'd update it.
      // The frontend sends socialLinks, let's map them.
      if (socialLinks) {
        company.socialLinks = {
          ...company.socialLinks,
          ...socialLinks
        };
      }
      if (companyLogo && companyLogo.url) {
        company.logo = {
          url: companyLogo.url,
          publicId: companyLogo.publicId || null
        };
      }

      await company.save();
    }
  }

  // Update profile completion
  const completedFields = [];
  if (userProfile.firstName) completedFields.push('firstName');
  if (userProfile.employerProfile?.companyName) completedFields.push('companyName');
  if (userProfile.employerProfile?.industry) completedFields.push('industry');
  if (userProfile.employerProfile?.companySize) completedFields.push('companySize');
  if (userProfile.employerProfile?.companyDescription) completedFields.push('companyDescription');
  if (userProfile.employerProfile?.companyWebsite) completedFields.push('companyWebsite');

  userProfile.profileCompletion = {
    percentage: Math.round((completedFields.length / 7) * 100),
    completedFields,
    lastUpdatedField: 'employerProfile',
    lastUpdatedDate: new Date(),
  };

  await userProfile.save();

  res.status(200).json({
    success: true,
    data: userProfile,
    message: 'Employer profile updated successfully',
  });
});

// @desc Get employer data for company profile
// @route GET /api/v1/user-profiles/employer/company-data
// @access Private
exports.getEmployerCompanyData = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'employer') {
    return next(new ErrorResponse('Only employers can access this data', 403));
  }

  let userProfile = await UserProfile.findOne({ userId: req.user.id });

  // Fetch the user to check for linked company
  const user = await User.findById(req.user.id);
  let companyDataFromModel = null;

  if (user.company) {
    companyDataFromModel = await Company.findById(user.company);
  }

  // If no profile exists, create one with user data
  if (!userProfile) {
    userProfile = await UserProfile.create({
      userId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: 'employer',
      employerProfile: {},
    });
  }

  // Prioritize Company model data if available, otherwise fallback to UserProfile
  const companyData = {
    name: companyDataFromModel?.name || userProfile.employerProfile?.companyName || '',
    email: companyDataFromModel?.email || userProfile.email || req.user.email,
    phone: companyDataFromModel?.phone || userProfile.phone || req.user.phone || '',
    location: companyDataFromModel?.location || userProfile.location || req.user.location || '',
    website: companyDataFromModel?.website || userProfile.employerProfile?.companyWebsite || '',
    industry: companyDataFromModel?.industry || userProfile.employerProfile?.industry || '',
    size: companyDataFromModel?.size || userProfile.employerProfile?.companySize || '',
    description: companyDataFromModel?.description || userProfile.employerProfile?.companyDescription || '',
    logo: companyDataFromModel?.logo?.url || userProfile.employerProfile?.companyLogo?.url || '',
    founded: companyDataFromModel?.foundedYear ? companyDataFromModel.foundedYear.toString() : '',
    tagline: userProfile.headline || '', // Tagline not in Company model schema
    culture: userProfile.bio || '', // Using bio for culture as per previous logic
    socialLinks: companyDataFromModel?.socialLinks || userProfile.socialLinks || {},
  };

  res.status(200).json({
    success: true,
    data: companyData,
  });
});

// @desc Delete user profile
// @route DELETE /api/v1/user-profiles/:userId
// @access Private
exports.deleteUserProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Only allow user to delete their own profile or admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this profile', 403));
  }

  await UserProfile.findOneAndDelete({ userId });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Profile deleted successfully',
  });
});

// @desc Upload profile picture
// @route POST /api/v1/user-profiles/upload-profile-pic
// @access Private
exports.uploadProfilePic = catchAsync(async (req, res, next) => {
  try {
    console.log('=== UPLOAD PROFILE PIC ===');
    console.log('User ID:', req.user?.id);
    console.log('File exists:', !!req.file);
    
    if (!req.file) {
      console.log('No file provided in request');
      return next(new ErrorResponse('Please upload a file', 400));
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      public_id: req.file.public_id,
    });

    if (!req.user || !req.user.id) {
      console.error('User not authenticated properly');
      return next(new ErrorResponse('User not authenticated', 401));
    }

    // Extract the URL from Cloudinary response
    const profilePhotoUrl = req.file.path; // Cloudinary URL
    const publicId = req.file.public_id; // Cloudinary public ID

    console.log('Saving to database - URL:', profilePhotoUrl);

    // Update user's profile picture URL
    const userProfile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { 
        profilePhoto: {
          url: profilePhotoUrl,
          publicId: publicId || null,
        }
      },
      { new: true, upsert: true }
    ).catch(err => {
      console.error('Error updating UserProfile:', err);
      throw err;
    });

    console.log('UserProfile updated successfully:', {
      id: userProfile._id,
      profilePhoto: userProfile.profilePhoto,
    });

    // Also update the User model if needed
    await User.findByIdAndUpdate(
      req.user.id, 
      { profilePhoto: profilePhotoUrl }
    ).catch(err => {
      console.error('Error updating User model:', err);
      // Don't throw, this is secondary
    });

    console.log('Upload completed successfully');
    res.status(200).json({
      success: true,
      data: {
        profilePic: profilePhotoUrl,
        profilePhoto: {
          url: profilePhotoUrl,
          publicId: publicId,
        },
      },
      message: 'Profile picture uploaded successfully',
    });
  } catch (error) {
    console.error('=== ERROR IN UPLOADPROFILEPIC ===');
    console.error('Error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    next(error);
  }
});
