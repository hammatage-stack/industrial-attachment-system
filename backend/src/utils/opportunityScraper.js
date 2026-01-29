const axios = require('axios');
const cheerio = require('cheerio');
const Opportunity = require('../models/Opportunity');
const logger = require('./logger');

/**
 * Web Scraper for Opportunity Aggregation
 * Collects opportunities from public job boards and websites
 */
class OpportunityScraper {
  constructor() {
    this.sources = [
      {
        name: 'Nafuu',
        url: 'https://nafuu.com/jobs',
        selector: '.job-card'
      },
      {
        name: 'Kiota',
        url: 'https://kiota.com/jobs',
        selector: '.vacancy'
      },
      {
        name: 'LinkedIn',
        url: 'https://linkedin.com/jobs/search/?keywords=attachment+internship+kenya',
        selector: '.base-card'
      },
      {
        name: 'Brighter Monday',
        url: 'https://brightermonday.co.ke/jobs',
        selector: '.job'
      }
    ];
  }

  /**
   * Fetch and parse opportunities from a source
   */
  async scrapeSource(source) {
    try {
      logger.info(`Scraping opportunities from ${source.name}`);

      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const opportunities = [];

      $(source.selector).each((i, element) => {
        try {
          const opportunity = {
            title: $(element).find('.title, .job-title, h2').text().trim(),
            company: $(element).find('.company, .company-name').text().trim(),
            location: $(element).find('.location, .city').text().trim(),
            description: $(element).find('.description, .summary').text().trim(),
            source: source.name,
            sourceUrl: source.url,
            salary: this.extractSalary($(element).text()),
            applicationType: this.identifyOpportunityType($(element).text()),
            status: 'active',
            deadline: this.calculateDeadline(),
            postedDate: new Date()
          };

          if (opportunity.title && opportunity.company) {
            opportunities.push(opportunity);
          }
        } catch (error) {
          logger.warn(`Error parsing individual opportunity: ${error.message}`);
        }
      });

      logger.info(`Successfully scraped ${opportunities.length} opportunities from ${source.name}`);
      return opportunities;
    } catch (error) {
      logger.error(`Failed to scrape ${source.name}:`, error.message);
      return [];
    }
  }

  /**
   * Scrape all sources
   */
  async scrapeAllSources() {
    try {
      const allOpportunities = [];

      for (const source of this.sources) {
        const opportunities = await this.scrapeSource(source);
        allOpportunities.push(...opportunities);
      }

      logger.info(`Total opportunities scraped: ${allOpportunities.length}`);
      return allOpportunities;
    } catch (error) {
      logger.error('Scrape all sources error:', error);
      return [];
    }
  }

  /**
   * Deduplicate opportunities by title and company
   */
  deduplicateOpportunities(opportunities) {
    const seen = new Set();
    const unique = [];

    opportunities.forEach(opp => {
      const key = `${opp.title}-${opp.company}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(opp);
      }
    });

    logger.info(`Deduplication: ${opportunities.length} → ${unique.length} opportunities`);
    return unique;
  }

  /**
   * Extract salary from text
   */
  extractSalary(text) {
    const salaryMatch = text.match(/KES[\s]*([\d,]+)\s*-?\s*(?:KES)?\s*([\d,]*)/i);
    if (salaryMatch) {
      return {
        min: parseInt(salaryMatch[1].replace(/,/g, '')),
        max: salaryMatch[2] ? parseInt(salaryMatch[2].replace(/,/g, '')) : null,
        currency: 'KES'
      };
    }
    return null;
  }

  /**
   * Identify opportunity type
   */
  identifyOpportunityType(text) {
    if (/industrial[\s-]?attachment|attachment/i.test(text)) {
      return 'attachment';
    }
    if (/internship|intern/i.test(text)) {
      return 'internship';
    }
    if (/graduate[\s-]?trainee|traineeship/i.test(text)) {
      return 'trainee';
    }
    return 'other';
  }

  /**
   * Calculate deadline (default to 30 days from now)
   */
  calculateDeadline() {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    return deadline;
  }

  /**
   * Save opportunities to database
   */
  async saveOpportunities(opportunities) {
    try {
      let added = 0;
      let updated = 0;

      for (const opp of opportunities) {
        const existing = await Opportunity.findOne({
          title: opp.title,
          company: opp.company
        });

        if (existing) {
          // Update existing opportunity
          await Opportunity.updateOne({ _id: existing._id }, opp);
          updated++;
        } else {
          // Create new opportunity
          await Opportunity.create(opp);
          added++;
        }
      }

      logger.info(`Opportunities saved: ${added} added, ${updated} updated`);
      return { added, updated };
    } catch (error) {
      logger.error('Save opportunities error:', error);
      throw error;
    }
  }

  /**
   * Archive expired opportunities
   */
  async archiveExpiredOpportunities() {
    try {
      const result = await Opportunity.updateMany(
        { deadline: { $lt: new Date() }, status: 'active' },
        { status: 'archived' }
      );

      logger.info(`Archived ${result.modifiedCount} expired opportunities`);
      return result;
    } catch (error) {
      logger.error('Archive opportunities error:', error);
      throw error;
    }
  }

  /**
   * Run full aggregation pipeline
   */
  async runAggregation() {
    try {
      logger.info('Starting opportunity aggregation...');

      // 1. Scrape all sources
      const opportunities = await this.scrapeAllSources();

      // 2. Deduplicate
      const unique = this.deduplicateOpportunities(opportunities);

      // 3. Save to database
      const result = await this.saveOpportunities(unique);

      // 4. Archive expired
      await this.archiveExpiredOpportunities();

      logger.info('Opportunity aggregation completed');
      return {
        success: true,
        scraped: opportunities.length,
        unique: unique.length,
        ...result
      };
    } catch (error) {
      logger.error('Aggregation pipeline error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OpportunityScraper();
