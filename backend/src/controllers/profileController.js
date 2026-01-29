const User = require('../models/User');
const fileUpload = require('../utils/fileUpload');
const logger = require('../utils/logger');

/**
 * User Profile Controller
 * Manages user profile and preferences
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, dateOfBirth, location, skills, preferences } = req.body;
    const userId = req.user.id;

    const updateData = {
      firstName,
      lastName,
      dateOfBirth,
      location,
      skills,
      preferences
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`Profile updated for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Upload profile picture
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await fileUpload.uploadToCloudinary(req.file, 'profiles');

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: {
          url: result.url,
          publicId: result.publicId
        }
      },
      { new: true }
    ).select('-password');

    logger.info(`Profile picture uploaded for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded',
      user
    });
  } catch (error) {
    logger.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

/**
 * Update preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, opportunityTypes, locations } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          emailNotifications: emailNotifications || true,
          smsNotifications: smsNotifications || true,
          opportunityTypes: opportunityTypes || [],
          locations: locations || []
        }
      },
      { new: true }
    ).select('-password');

    logger.info(`Preferences updated for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Preferences updated',
      preferences: user.preferences
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const Application = require('../models/Application');

    const applications = await Application.find({ user: userId });

    const stats = {
      totalApplications: applications.length,
      submitted: applications.filter(a => a.status !== 'draft').length,
      underReview: applications.filter(a => a.status === 'under-review').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      successRate: applications.length > 0
        ? ((applications.filter(a => a.status === 'accepted').length / applications.length) * 100).toFixed(2)
        : '0'
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Delete account (soft delete)
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Soft delete
    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    logger.info(`Account deleted for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};
