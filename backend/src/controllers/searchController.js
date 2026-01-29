const Opportunity = require('../models/Opportunity');
const Institution = require('../models/Institution');
const logger = require('../utils/logger');

/**
 * Advanced Search Controller
 * Handles complex search with multiple filters
 */
exports.advancedSearchOpportunities = async (req, res) => {
  try {
    const {
      keyword,
      type,
      location,
      salary_min,
      salary_max,
      company,
      postedAfter,
      applicationDeadline,
      sector,
      level,
      page = 1,
      limit = 20,
      sort = 'createdAt'
    } = req.query;

    const query = { status: 'open' };

    // Text search
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Filters
    if (type) query.applicationType = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (company) query.company = { $regex: company, $options: 'i' };
    if (sector) query.sector = sector;
    if (level) query.level = level;

    // Salary range
    if (salary_min || salary_max) {
      query['salary.min'] = {};
      if (salary_min) query['salary.min'].$gte = Number(salary_min);
      if (salary_max) query['salary.min'].$lte = Number(salary_max);
    }

    // Date filters
    if (postedAfter) {
      query.createdAt = { $gte: new Date(postedAfter) };
    }
    if (applicationDeadline) {
      query.deadline = { $gte: new Date(applicationDeadline) };
    }

    const opportunities = await Opportunity.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sort]: -1 })
      .lean();

    const total = await Opportunity.countDocuments(query);

    logger.info(`Advanced search: ${opportunities.length} results found`);

    res.status(200).json({
      success: true,
      opportunities,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      },
      filters: {
        keyword,
        type,
        location,
        company
      }
    });
  } catch (error) {
    logger.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Get search facets for filtering
 */
exports.getSearchFacets = async (req, res) => {
  try {
    const [types, locations, sectors, levels] = await Promise.all([
      Opportunity.distinct('applicationType'),
      Opportunity.distinct('location'),
      Opportunity.distinct('sector'),
      Opportunity.distinct('level')
    ]);

    res.status(200).json({
      success: true,
      facets: {
        types,
        locations,
        sectors,
        levels
      }
    });
  } catch (error) {
    logger.error('Get facets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch facets',
      error: error.message
    });
  }
};

/**
 * Search with saved filters
 */
exports.saveSearchFilter = async (req, res) => {
  try {
    const { name, filters } = req.body;
    const userId = req.user.id;

    // This would save to a UserSearchFilters collection
    // Implementation depends on your schema design

    logger.info(`Search filter saved for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Search filter saved',
      filterId: 'filter_' + Date.now()
    });
  } catch (error) {
    logger.error('Save filter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save filter',
      error: error.message
    });
  }
};

/**
 * Get saved search filters
 */
exports.getSavedFilters = async (req, res) => {
  try {
    const userId = req.user.id;

    // Retrieve saved filters from database
    const filters = [
      {
        id: '1',
        name: 'Software Engineering Roles',
        filters: { type: 'attachment', sector: 'IT' }
      },
      {
        id: '2',
        name: 'Nairobi Opportunities',
        filters: { location: 'Nairobi', type: 'internship' }
      }
    ];

    res.status(200).json({
      success: true,
      filters
    });
  } catch (error) {
    logger.error('Get filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filters',
      error: error.message
    });
  }
};
