const Institution = require('../models/Institution');

// @desc    Get all institutions with search and filter
// @route   GET /api/institutions
// @access  Public
exports.getAllInstitutions = async (req, res) => {
  try {
    const {
      search,
      type,
      county,
      subCounty,
      page = 1,
      limit = 20,
      verified = true
    } = req.query;

    const query = { status: 'open' };

    // Add verified filter if not admin
    if (!req.user || req.user.role !== 'admin') {
      query.isVerified = verified === 'true' || verified === true;
    }

    // Search by name, description, or sectors
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sectors: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by location
    if (county) {
      query['location.county'] = { $regex: county, $options: 'i' };
    }
    if (subCounty) {
      query['location.subCounty'] = { $regex: subCounty, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const institutions = await Institution.find(query)
      .select('-logo.publicId')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Institution.countDocuments(query);

    res.status(200).json({
      success: true,
      count: institutions.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      institutions
    });
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institutions',
      error: error.message
    });
  }
};

// @desc    Get single institution
// @route   GET /api/institutions/:id
// @access  Public
exports.getInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // Check if user is admin or institution is verified and active
    if (
      (!req.user || req.user.role !== 'admin') &&
      (!institution.isVerified || institution.status !== 'active')
    ) {
      return res.status(403).json({
        success: false,
        message: 'Institution not accessible'
      });
    }

    res.status(200).json({
      success: true,
      institution
    });
  } catch (error) {
    console.error('Get institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institution',
      error: error.message
    });
  }
};

// @desc    Get institution types (for dropdown)
// @route   GET /api/institutions/types/list
// @access  Public
exports.getInstitutionTypes = async (req, res) => {
  try {
    const types = [
      'company',
      'organization',
      'ngo',
      'government-agency',
      'high-school',
      'secondary-school',
      'college',
      'university',
      'tvet',
      'other'
    ];

    res.status(200).json({
      success: true,
      types
    });
  } catch (error) {
    console.error('Get institution types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institution types',
      error: error.message
    });
  }
};

// @desc    Get unique counties (for dropdown)
// @route   GET /api/institutions/counties
// @access  Public
exports.getCounties = async (req, res) => {
  try {
    const counties = await Institution.distinct('location.county', {
      status: 'active',
      isVerified: true
    });

    res.status(200).json({
      success: true,
      counties: counties.sort()
    });
  } catch (error) {
    console.error('Get counties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counties',
      error: error.message
    });
  }
};

// @desc    Get sub-counties by county
// @route   GET /api/institutions/sub-counties/:county
// @access  Public
exports.getSubCounties = async (req, res) => {
  try {
    const { county } = req.params;

    const subCounties = await Institution.distinct(
      'location.subCounty',
      {
        'location.county': { $regex: county, $options: 'i' },
        status: 'active',
        isVerified: true
      }
    );

    res.status(200).json({
      success: true,
      subCounties: subCounties.sort()
    });
  } catch (error) {
    console.error('Get sub-counties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sub-counties',
      error: error.message
    });
  }
};

// @desc    Create institution (Admin)
// @route   POST /api/institutions
// @access  Private/Admin
exports.createInstitution = async (req, res) => {
  try {
    const institution = await Institution.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Institution created',
      institution
    });
  } catch (error) {
    console.error('Create institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating institution',
      error: error.message
    });
  }
};

// @desc    Update institution (Admin)
// @route   PUT /api/institutions/:id
// @access  Private/Admin
exports.updateInstitution = async (req, res) => {
  try {
    let institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Institution updated',
      institution
    });
  } catch (error) {
    console.error('Update institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating institution',
      error: error.message
    });
  }
};

// @desc    Verify institution (Admin)
// @route   PUT /api/institutions/:id/verify
// @access  Private/Admin
exports.verifyInstitution = async (req, res) => {
  try {
    let institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    institution.isVerified = true;
    institution.verifiedAt = new Date();
    institution.verifiedBy = req.user.id;
    institution.status = 'active';

    await institution.save();

    res.status(200).json({
      success: true,
      message: 'Institution verified',
      institution
    });
  } catch (error) {
    console.error('Verify institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying institution',
      error: error.message
    });
  }
};

// @desc    Delete institution (Admin)
// @route   DELETE /api/institutions/:id
// @access  Private/Admin
exports.deleteInstitution = async (req, res) => {
  try {
    const institution = await Institution.findByIdAndDelete(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Institution deleted'
    });
  } catch (error) {
    console.error('Delete institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting institution',
      error: error.message
    });
  }
};
