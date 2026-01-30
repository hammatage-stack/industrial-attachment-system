const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Get user profile
 * @route   GET /api/search/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        institution: user.institution,
        bio: user.bio || '',
        location: user.location || '',
        profilePicture: user.profilePicture || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @route   PATCH /api/search/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, location, phoneNumber } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    logger.info(`Profile updated for user ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        bio: user.bio || '',
        location: user.location || ''
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Update user preferences
 * @route   PATCH /api/search/profile/preferences
 * @access  Private
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preference fields
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) user.smsNotifications = smsNotifications;
    if (preferences) user.preferences = preferences;

    await user.save();

    logger.info(`Preferences updated for user ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: {
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

/**
 * Upload profile picture
 * @route   POST /api/search/profile/picture
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // In a real app, this would upload to Cloudinary
    // For now, just save the file path
    user.profilePicture = req.file.path || req.file.filename;
    await user.save();

    logger.info(`Profile picture updated for user ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    logger.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

/**
 * Change user password
 * @route   POST /api/search/profile/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 * @route   GET /api/search/profile/stats
 * @access  Private
 */
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate basic statistics (can be extended based on models)
    const stats = {
      userId: user._id,
      accountCreatedDate: user.createdAt,
      role: user.role,
      accountStatus: user.isActive ? 'active' : 'inactive'
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

/**
 * Delete user account
 * @route   POST /api/search/profile/delete
 * @access  Private
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password before deletion
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    logger.info(`User account deleted: ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};
