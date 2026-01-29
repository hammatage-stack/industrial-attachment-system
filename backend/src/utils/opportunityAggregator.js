const axios = require('axios');
const Opportunity = require('../models/Opportunity');
const logger = require('./logger');

class OpportunityAggregator {
  constructor() {
    this.sources = [
      {
        name: 'linkedin',
        url: 'https://api.example.com/opportunities',
        headers: { 'Authorization': 'Bearer ' + process.env.LINKEDIN_API_KEY }
      },
      {
        name: 'company-website',
        url: 'https://api.example.com/jobs',
        headers: {}
      }
    ];
  }

  /**
   * Fetch opportunities from configured sources
   * This is a template - actual implementation depends on source APIs
   */
  async fetchFromSources() {
    const opportunities = [];

    try {
      for (const source of this.sources) {
        try {
          logger.info(`Fetching opportunities from ${source.name}`);
          const response = await axios.get(source.url, { headers: source.headers });

          if (response.data && Array.isArray(response.data.opportunities)) {
            opportunities.push(...response.data.opportunities);
          }
        } catch (error) {
          logger.error(`Error fetching from ${source.name}:`, error.message);
        }
      }

      return opportunities;
    } catch (error) {
      logger.error('Error in fetchFromSources:', error);
      return [];
    }
  }

  /**
   * Detect and remove duplicate opportunities
   */
  async deduplicateOpportunities(opportunities) {
    const deduped = [];
    const titleCompanySet = new Set();

    for (const opp of opportunities) {
      const key = `${opp.title}-${opp.companyName}`.toLowerCase();

      if (!titleCompanySet.has(key)) {
        titleCompanySet.add(key);
        deduped.push(opp);
      }
    }

    return deduped;
  }

  /**
   * Normalize opportunity data from various sources
   */
  normalizeOpportunity(rawOpp) {
    return {
      companyName: rawOpp.company || rawOpp.companyName || 'Unknown',
      companyEmail: rawOpp.companyEmail || '',
      companyPhone: rawOpp.companyPhone || '',
      title: rawOpp.title || rawOpp.jobTitle || '',
      description: rawOpp.description || rawOpp.jobDescription || '',
      type: rawOpp.type || 'internship',
      category: rawOpp.category || 'Other',
      location: rawOpp.location || 'Kenya',
      duration: rawOpp.duration || '3 months',
      requirements: rawOpp.requirements || [],
      benefits: rawOpp.benefits || [],
      availableSlots: rawOpp.slots || rawOpp.availableSlots || 1,
      applicationDeadline: new Date(rawOpp.deadline) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      postedBy: rawOpp.postedBy // Should be an admin user ID
    };
  }

  /**
   * Check if opportunity has expired
   */
  isExpired(opportunity) {
    return new Date() > new Date(opportunity.applicationDeadline);
  }

  /**
   * Archive expired opportunities
   */
  async archiveExpiredOpportunities() {
    try {
      const expiredOpportunities = await Opportunity.find({
        applicationDeadline: { $lt: new Date() },
        status: { $ne: 'closed' }
      });

      const updatePromises = expiredOpportunities.map(opp => 
        Opportunity.findByIdAndUpdate(opp._id, { status: 'closed' })
      );

      await Promise.all(updatePromises);

      logger.info(`Archived ${expiredOpportunities.length} expired opportunities`);
      return expiredOpportunities.length;
    } catch (error) {
      logger.error('Error archiving expired opportunities:', error);
      return 0;
    }
  }

  /**
   * Main aggregation job - fetch, normalize, deduplicate, and save
   */
  async aggregateAndUpdate() {
    try {
      logger.info('Starting opportunity aggregation job');

      // Archive expired opportunities
      await this.archiveExpiredOpportunities();

      // Fetch from sources
      const rawOpportunities = await this.fetchFromSources();
      logger.info(`Fetched ${rawOpportunities.length} raw opportunities`);

      // Normalize
      const normalized = rawOpportunities.map(opp => this.normalizeOpportunity(opp));

      // Deduplicate
      const deduped = await this.deduplicateOpportunities(normalized);
      logger.info(`After deduplication: ${deduped.length} opportunities`);

      // Save or update in database
      let savedCount = 0;
      for (const opp of deduped) {
        try {
          // Check if opportunity exists based on title + company
          const exists = await Opportunity.findOne({
            title: opp.title,
            companyName: opp.companyName
          });

          if (!exists) {
            await Opportunity.create(opp);
            savedCount++;
          } else {
            // Update existing opportunity
            await Opportunity.findByIdAndUpdate(exists._id, opp);
          }
        } catch (error) {
          logger.error(`Error saving opportunity ${opp.title}:`, error.message);
        }
      }

      logger.info(`Aggregation complete. Saved/Updated: ${savedCount} opportunities`);
      return {
        success: true,
        message: `Aggregated ${deduped.length} opportunities, saved ${savedCount} new ones`,
        savedCount,
        totalProcessed: deduped.length
      };
    } catch (error) {
      logger.error('Opportunity aggregation error:', error);
      return {
        success: false,
        message: 'Aggregation failed',
        error: error.message
      };
    }
  }

  /**
   * Manual addition of opportunity (for testing)
   */
  async manuallyAddOpportunity(opportunityData) {
    try {
      const opportunity = await Opportunity.create(opportunityData);
      logger.info(`Manually added opportunity: ${opportunity.title}`);
      return opportunity;
    } catch (error) {
      logger.error('Error manually adding opportunity:', error);
      throw error;
    }
  }
}

module.exports = new OpportunityAggregator();
