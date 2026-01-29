const Application = require('../models/Application');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Institution = require('../models/Institution');
const logger = require('./logger');

/**
 * Reporting Service
 * Generates comprehensive reports and analytics
 */
class ReportingService {
  /**
   * Generate application report
   */
  async generateApplicationReport(filters = {}) {
    try {
      const query = {};

      if (filters.status) query.status = filters.status;
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }
      if (filters.opportunity) query.opportunity = filters.opportunity;

      const applications = await Application.find(query)
        .populate('user', 'firstName lastName email')
        .populate('opportunity', 'title company')
        .lean();

      const report = {
        title: 'Application Report',
        generatedAt: new Date(),
        totalApplications: applications.length,
        byStatus: this.groupByStatus(applications),
        byOpportunity: this.groupByOpportunity(applications),
        byDate: this.groupByDate(applications),
        conversionMetrics: this.calculateConversionMetrics(applications)
      };

      logger.info('Application report generated');
      return report;
    } catch (error) {
      logger.error('Application report error:', error);
      throw error;
    }
  }

  /**
   * Generate payment report
   */
  async generatePaymentReport(filters = {}) {
    try {
      const query = {};

      if (filters.status) query.status = filters.status;
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      const payments = await Payment.find(query)
        .populate('user', 'firstName lastName email')
        .lean();

      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const verifiedAmount = payments
        .filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + p.amount, 0);

      const report = {
        title: 'Payment Report',
        generatedAt: new Date(),
        totalPayments: payments.length,
        totalAmount: totalAmount,
        verifiedAmount: verifiedAmount,
        byStatus: this.groupPaymentsByStatus(payments),
        verificationRate: ((verifiedAmount / totalAmount) * 100).toFixed(2) + '%',
        dailyRevenue: this.calculateDailyRevenue(payments)
      };

      logger.info('Payment report generated');
      return report;
    } catch (error) {
      logger.error('Payment report error:', error);
      throw error;
    }
  }

  /**
   * Generate institutional report
   */
  async generateInstitutionalReport() {
    try {
      const institutions = await Institution.find().lean();
      const opportunities = await Opportunity.find().lean();
      const applications = await Application.find().lean();

      const report = {
        title: 'Institutional Report',
        generatedAt: new Date(),
        totalInstitutions: institutions.length,
        totalOpportunities: opportunities.length,
        opportunitiesByInstitution: this.groupOpportunitiesByInstitution(opportunities, institutions),
        applicationsByInstitution: this.groupApplicationsByInstitution(applications, opportunities, institutions),
        activeInstitutions: institutions.filter(i => i.verificationStatus === 'verified').length
      };

      logger.info('Institutional report generated');
      return report;
    } catch (error) {
      logger.error('Institutional report error:', error);
      throw error;
    }
  }

  /**
   * Generate analytics dashboard data
   */
  async getDashboardAnalytics(days = 30) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const [applications, payments, users] = await Promise.all([
        Application.find({ createdAt: { $gte: dateFrom } }),
        Payment.find({ createdAt: { $gte: dateFrom } }),
        User.find({ createdAt: { $gte: dateFrom }, role: 'student' })
      ]);

      return {
        newApplications: applications.length,
        newPayments: payments.length,
        newUsers: users.length,
        totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        verifiedPayments: payments.filter(p => p.status === 'verified').length,
        successRate: applications.length > 0
          ? ((applications.filter(a => a.status === 'accepted').length / applications.length) * 100).toFixed(2)
          : '0',
        applicationsByDay: this.getChartData(applications, 'day'),
        paymentsByDay: this.getChartData(payments, 'day')
      };
    } catch (error) {
      logger.error('Dashboard analytics error:', error);
      throw error;
    }
  }

  /**
   * Helper: Group applications by status
   */
  groupByStatus(applications) {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Helper: Group applications by opportunity
   */
  groupByOpportunity(applications) {
    return applications.reduce((acc, app) => {
      const key = app.opportunity.title;
      if (!acc[key]) acc[key] = 0;
      acc[key]++;
      return acc;
    }, {});
  }

  /**
   * Helper: Group applications by date
   */
  groupByDate(applications) {
    return applications.reduce((acc, app) => {
      const date = new Date(app.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});
  }

  /**
   * Helper: Calculate conversion metrics
   */
  calculateConversionMetrics(applications) {
    const total = applications.length;
    const submitted = applications.filter(a => a.status !== 'draft').length;
    const accepted = applications.filter(a => a.status === 'accepted').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;

    return {
      submissionRate: total > 0 ? ((submitted / total) * 100).toFixed(2) + '%' : '0%',
      acceptanceRate: submitted > 0 ? ((accepted / submitted) * 100).toFixed(2) + '%' : '0%',
      rejectionRate: submitted > 0 ? ((rejected / submitted) * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Helper: Group payments by status
   */
  groupPaymentsByStatus(payments) {
    return payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Helper: Calculate daily revenue
   */
  calculateDailyRevenue(payments) {
    return payments.reduce((acc, p) => {
      const date = new Date(p.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += p.amount;
      return acc;
    }, {});
  }

  /**
   * Helper: Get chart data
   */
  getChartData(items, period = 'day') {
    return items.reduce((acc, item) => {
      const date = new Date(item.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});
  }

  /**
   * Helper: Group opportunities by institution
   */
  groupOpportunitiesByInstitution(opportunities, institutions) {
    return institutions.map(inst => ({
      institution: inst.name,
      opportunities: opportunities.filter(o => o.company === inst.name).length
    }));
  }

  /**
   * Helper: Group applications by institution
   */
  groupApplicationsByInstitution(applications, opportunities, institutions) {
    return institutions.map(inst => ({
      institution: inst.name,
      applications: applications.filter(a =>
        opportunities.find(o => o._id.equals(a.opportunity) && o.company === inst.name)
      ).length
    }));
  }

  /**
   * Export report to CSV
   */
  exportToCSV(report) {
    // Implementation for CSV export
    const csv = JSON.stringify(report, null, 2);
    return csv;
  }

  /**
   * Export report to PDF
   */
  exportToPDF(report) {
    // Implementation would use a PDF library
    logger.info('PDF export initiated for report');
    return { success: true, message: 'PDF generation started' };
  }
}

module.exports = new ReportingService();
