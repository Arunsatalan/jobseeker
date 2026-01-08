const JobSeekerPreferences = require('../models/JobSeekerPreferences');
const JobSeeker = require('../models/JobSeeker');
const User = require('../models/User');

/**
 * Get JobSeeker preferences
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getPreferences = async (req, res) => {
  try {
    // Get user ID from token
    const userId = req.user.id; // @ts-ignore

    // Find JobSeeker by user ID
    const jobSeeker = await JobSeeker.findOne({ user: userId });

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Job seeker profile not found',
      });
    }

    // Find preferences
    const preferences = await JobSeekerPreferences.findOne({ jobSeeker: jobSeeker._id });

    if (!preferences) {
      // Return default preferences if not found
      return res.json({
        success: true,
        data: {
          desiredRoles: [],
          locations: [],
          salaryMin: 60000,
          salaryMax: 100000,
          salaryPeriod: 'yearly',
          experienceLevel: 'Mid-level',
          workType: [],
          availability: 'Immediately',
          industries: [],
          companySize: [],
          benefits: [],
          growthOpportunities: [],
          profileVisible: false,
        },
      });
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences',
      error: /** @type {Error} */ (error).message,
    });
  }
};

/**
 * Create or Update preferences
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.savePreferences = async (req, res) => {
  try {
    const userId = req.user.id; // @ts-ignore
    const {
      desiredRoles,
      locations,
      salaryMin,
      salaryMax,
      salaryPeriod,
      experienceLevel,
      workType,
      availability,
      industries,
      companySize,
      benefits,
      growthOpportunities,
      profileVisible,
    } = req.body;

    // Find JobSeeker
    const jobSeeker = await JobSeeker.findOne({ user: userId });

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Job seeker profile not found',
      });
    }

    // Find and update or create preferences
    let preferences = await JobSeekerPreferences.findOne({ jobSeeker: jobSeeker._id });

    if (preferences) {
      // Update existing
      preferences.desiredRoles = desiredRoles || preferences.desiredRoles;
      preferences.locations = locations || preferences.locations;
      preferences.salaryMin = salaryMin !== undefined ? salaryMin : preferences.salaryMin;
      preferences.salaryMax = salaryMax !== undefined ? salaryMax : preferences.salaryMax;
      preferences.salaryPeriod = salaryPeriod || preferences.salaryPeriod;
      preferences.experienceLevel = experienceLevel || preferences.experienceLevel;
      preferences.workType = workType || preferences.workType;
      preferences.availability = availability || preferences.availability;
      preferences.industries = industries || preferences.industries;
      preferences.companySize = companySize || preferences.companySize;
      preferences.benefits = benefits || preferences.benefits;
      preferences.growthOpportunities = growthOpportunities || preferences.growthOpportunities;
      preferences.profileVisible = profileVisible !== undefined ? profileVisible : preferences.profileVisible;
    } else {
      // Create new
      preferences = new JobSeekerPreferences({
        jobSeeker: jobSeeker._id,
        desiredRoles: desiredRoles || [],
        locations: locations || [],
        salaryMin: salaryMin || 60000,
        salaryMax: salaryMax || 100000,
        salaryPeriod: salaryPeriod || 'yearly',
        experienceLevel: experienceLevel || 'Mid-level',
        workType: workType || [],
        availability: availability || 'Immediately',
        industries: industries || [],
        companySize: companySize || [],
        benefits: benefits || [],
        growthOpportunities: growthOpportunities || [],
        profileVisible: profileVisible || false,
      });
    }

    await preferences.save();

    res.json({
      success: true,
      message: 'Preferences saved successfully',
      data: preferences,
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save preferences',
      error: /** @type {Error} */ (error).message,
    });
  }
};

/**
 * Update specific preference fields
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id; // @ts-ignore

    // Find JobSeeker
    const jobSeeker = await JobSeeker.findOne({ user: userId });

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Job seeker profile not found',
      });
    }

    // Find and update preferences
    const preferences = await JobSeekerPreferences.findOneAndUpdate(
      { jobSeeker: jobSeeker._id },
      { ...req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: /** @type {Error} */ (error).message,
    });
  }
};

/**
 * Delete all preferences (reset to defaults)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.deletePreferences = async (req, res) => {
  try {
    const userId = req.user.id; // @ts-ignore

    // Find JobSeeker
    const jobSeeker = await JobSeeker.findOne({ user: userId });

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: 'Job seeker profile not found',
      });
    }

    // Delete preferences
    await JobSeekerPreferences.findOneAndDelete({ jobSeeker: jobSeeker._id });

    res.json({
      success: true,
      message: 'Preferences deleted successfully',
      data: {
        desiredRoles: [],
        locations: [],
        salaryMin: 60000,
        salaryMax: 100000,
        salaryPeriod: 'yearly',
        experienceLevel: 'Mid-level',
        workType: [],
        availability: 'Immediately',
        profileVisible: false,
      },
    });
  } catch (error) {
    console.error('Error deleting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete preferences',
      error: /** @type {Error} */ (error).message,
    });
  }
};
