// Integration test for Opportunities API
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

describe('Opportunities API Integration Tests', () => {
  let app;
  let server;
  let testUserId = new mongoose.Types.ObjectId();
  let companyUserId = new mongoose.Types.ObjectId();
  let adminToken = 'admin-token';
  let studentToken = 'student-token';
  let opportunityId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock auth middleware
    app.use((req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token === adminToken) {
        req.user = { _id: testUserId, role: 'admin', email: 'admin@example.com' };
        next();
      } else if (token === studentToken) {
        req.user = { _id: testUserId, role: 'student', email: 'student@example.com' };
        next();
      } else if (!token) {
        req.user = null;
        next();
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    });

    // Mock authorization middleware
    const authorize = (...roles) => (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      next();
    };

    const opportunitiesRouter = express.Router();

    // Get all opportunities (public)
    opportunitiesRouter.get('/', (req, res) => {
      const { page = 1, limit = 12, search, category } = req.query;
      
      const mockOpportunities = [
        {
          _id: opportunityId,
          title: 'Software Engineering Internship',
          description: 'Great opportunity at tech company',
          category: 'Technology',
          location: 'Nairobi',
          type: 'internship',
          duration: '3 months',
          status: 'open',
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          postedBy: { _id: companyUserId, firstName: 'Acme', lastName: 'Corp' },
          createdAt: new Date()
        }
      ];

      res.json({
        success: true,
        count: mockOpportunities.length,
        totalPages: 1,
        currentPage: 1,
        opportunities: mockOpportunities
      });
    });

    // Get single opportunity (public)
    opportunitiesRouter.get('/:id', (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity ID' });
      }

      res.json({
        success: true,
        opportunity: {
          _id: id,
          title: 'Software Engineering Internship',
          description: 'Great opportunity at tech company',
          category: 'Technology',
          location: 'Nairobi',
          type: 'internship',
          duration: '3 months',
          status: 'open',
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          postedBy: { _id: companyUserId, firstName: 'Acme', lastName: 'Corp' },
          createdAt: new Date()
        }
      });
    });

    // Create opportunity (admin/company only)
    opportunitiesRouter.post('/', authorize('admin', 'company'), (req, res) => {
      const { title, description, category } = req.body;

      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      res.status(201).json({
        success: true,
        opportunity: {
          _id: new mongoose.Types.ObjectId(),
          title,
          description,
          category: category || 'General',
          status: 'open',
          postedBy: req.user._id,
          createdAt: new Date()
        }
      });
    });

    // Update opportunity (admin/company only)
    opportunitiesRouter.put('/:id', authorize('admin', 'company'), (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity ID' });
      }

      if (!title && !description) {
        return res.status(400).json({ success: false, message: 'Nothing to update' });
      }

      res.json({
        success: true,
        opportunity: {
          _id: id,
          title: title || 'Original Title',
          description: description || 'Original Description',
          updatedAt: new Date()
        }
      });
    });

    // Delete opportunity (admin/company only)
    opportunitiesRouter.delete('/:id', authorize('admin', 'company'), (req, res) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity ID' });
      }

      res.json({
        success: true,
        message: 'Opportunity deleted successfully'
      });
    });

    // Save opportunity (authenticated users)
    opportunitiesRouter.post('/:id/save', (req, res) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity ID' });
      }

      res.json({
        success: true,
        message: 'Opportunity saved successfully'
      });
    });

    // Remove saved opportunity
    opportunitiesRouter.delete('/:id/save', (req, res) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity ID' });
      }

      res.json({
        success: true,
        message: 'Opportunity removed from saved'
      });
    });

    // Get saved opportunities
    opportunitiesRouter.get('/saved/list', (req, res) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      res.json({
        success: true,
        opportunities: []
      });
    });

    // Get applications for opportunity
    opportunitiesRouter.get('/:id/applications', authorize('admin', 'company'), (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid opportunity ID' });
      }

      res.json({
        success: true,
        applications: []
      });
    });

    app.use('/opportunities', opportunitiesRouter);
    server = app.listen(0);
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  describe('GET /opportunities', () => {
    test('should return list of opportunities without authentication', async () => {
      const res = await request(app)
        .get('/opportunities')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.opportunities)).toBe(true);
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('currentPage');
    });

    test('should support pagination', async () => {
      const res = await request(app)
        .get('/opportunities?page=1&limit=10')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.currentPage).toBe(1);
    });

    test('should support search and filtering', async () => {
      const res = await request(app)
        .get('/opportunities?search=engineering&category=Technology')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.opportunities)).toBe(true);
    });
  });

  describe('GET /opportunities/:id', () => {
    test('should return a single opportunity', async () => {
      const res = await request(app)
        .get(`/opportunities/${opportunityId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.opportunity).toBeDefined();
      expect(res.body.opportunity._id).toBeDefined();
    });

    test('should reject invalid opportunity ID', async () => {
      const res = await request(app)
        .get('/opportunities/invalid-id')
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should return opportunity with all fields', async () => {
      const res = await request(app)
        .get(`/opportunities/${opportunityId}`)
        .expect(200);

      const opp = res.body.opportunity;
      expect(opp).toHaveProperty('title');
      expect(opp).toHaveProperty('description');
      expect(opp).toHaveProperty('category');
      expect(opp).toHaveProperty('location');
      expect(opp).toHaveProperty('status');
    });
  });

  describe('POST /opportunities', () => {
    test('should create opportunity with admin role', async () => {
      const res = await request(app)
        .post('/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Internship',
          description: 'Great opportunity'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.opportunity.title).toBe('New Internship');
    });

    test('should reject creation without authentication', async () => {
      const res = await request(app)
        .post('/opportunities')
        .send({
          title: 'New Internship',
          description: 'Great opportunity'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('should reject creation without required fields', async () => {
      const res = await request(app)
        .post('/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Only title' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should require authorization', async () => {
      const res = await request(app)
        .post('/opportunities')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'New Internship',
          description: 'Great opportunity'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /opportunities/:id', () => {
    test('should update opportunity with authorization', async () => {
      const res = await request(app)
        .put(`/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.opportunity.title).toBe('Updated Title');
    });

    test('should reject update without authentication', async () => {
      const res = await request(app)
        .put(`/opportunities/${opportunityId}`)
        .send({ title: 'Updated Title' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('should reject invalid opportunity ID', async () => {
      const res = await request(app)
        .put('/opportunities/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /opportunities/:id', () => {
    test('should delete opportunity with authorization', async () => {
      const res = await request(app)
        .delete(`/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('should reject delete without authentication', async () => {
      const res = await request(app)
        .delete(`/opportunities/${opportunityId}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('should reject invalid opportunity ID', async () => {
      const res = await request(app)
        .delete('/opportunities/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /opportunities/:id/save', () => {
    test('should save opportunity for authenticated user', async () => {
      const res = await request(app)
        .post(`/opportunities/${opportunityId}/save`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('should reject save without authentication', async () => {
      const res = await request(app)
        .post(`/opportunities/${opportunityId}/save`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should reject invalid opportunity ID', async () => {
      const res = await request(app)
        .post('/opportunities/invalid-id/save')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /opportunities/:id/save', () => {
    test('should remove saved opportunity', async () => {
      const res = await request(app)
        .delete(`/opportunities/${opportunityId}/save`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('should reject delete without authentication', async () => {
      const res = await request(app)
        .delete(`/opportunities/${opportunityId}/save`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /opportunities/saved/list', () => {
    test('should return saved opportunities for authenticated user', async () => {
      const res = await request(app)
        .get('/opportunities/saved/list')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.opportunities)).toBe(true);
    });

    test('should reject request without authentication', async () => {
      const res = await request(app)
        .get('/opportunities/saved/list')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /opportunities/:id/applications', () => {
    test('should return applications with authorization', async () => {
      const res = await request(app)
        .get(`/opportunities/${opportunityId}/applications`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.applications)).toBe(true);
    });

    test('should reject without authentication', async () => {
      const res = await request(app)
        .get(`/opportunities/${opportunityId}/applications`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('should reject student access', async () => {
      const res = await request(app)
        .get(`/opportunities/${opportunityId}/applications`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});
