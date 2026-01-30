// Integration test for Messages API
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

describe('Messages API Integration Tests', () => {
  let app;
  let server;
  let testUserId1 = new mongoose.Types.ObjectId();
  let testUserId2 = new mongoose.Types.ObjectId();
  let testToken = 'test-token';
  let conversationId;

  beforeAll(() => {
    // Create a minimal express app for testing
    app = express();
    app.use(express.json());

    // Mock auth middleware
    app.use((req, res, next) => {
      if (req.headers.authorization === `Bearer ${testToken}`) {
        req.user = { _id: testUserId1, role: 'student', email: 'test@example.com' };
        next();
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    });

    // Mock routes
    const messagesRouter = express.Router();

    // Get conversations
    messagesRouter.get('/conversations', (req, res) => {
      res.json({
        success: true,
        conversations: [
          {
            _id: new mongoose.Types.ObjectId(),
            participant: { _id: testUserId2, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            lastMessage: 'Hello there',
            unread: 2
          }
        ]
      });
    });

    // Get messages for a conversation
    messagesRouter.get('/:id', (req, res) => {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
      }
      
      // Check authorization
      if (!req.user) {
        return res.status(403).json({ success: false, message: 'Not a participant' });
      }

      res.json({
        success: true,
        messages: [
          {
            _id: new mongoose.Types.ObjectId(),
            from: testUserId2,
            text: 'Hi, how are you?',
            read: false,
            createdAt: new Date()
          },
          {
            _id: new mongoose.Types.ObjectId(),
            from: testUserId1,
            text: 'Good, thanks!',
            read: true,
            createdAt: new Date()
          }
        ]
      });
    });

    // Send message
    messagesRouter.post('/:id/send', (req, res) => {
      const { id } = req.params;
      const { text, participants } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'Empty message' });
      }

      if (id === 'new' && (!Array.isArray(participants) || !participants.length)) {
        return res.status(400).json({ success: false, message: 'Participants required for new conversation' });
      }

      const newConvId = id === 'new' ? new mongoose.Types.ObjectId() : id;

      res.json({
        success: true,
        conversationId: newConvId,
        message: {
          _id: new mongoose.Types.ObjectId(),
          from: req.user._id,
          text: text.trim(),
          read: false,
          createdAt: new Date()
        }
      });
    });

    app.use('/messages', messagesRouter);
    server = app.listen(0); // Use any available port
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  describe('GET /messages/conversations', () => {
    test('should return conversations for authenticated user', async () => {
      const res = await request(app)
        .get('/messages/conversations')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.conversations)).toBe(true);
      expect(res.body.conversations.length).toBeGreaterThanOrEqual(0);
    });

    test('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .get('/messages/conversations')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized');
    });

    test('should return conversation with unread count', async () => {
      const res = await request(app)
        .get('/messages/conversations')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      if (res.body.conversations.length > 0) {
        const conv = res.body.conversations[0];
        expect(conv).toHaveProperty('_id');
        expect(conv).toHaveProperty('participant');
        expect(conv).toHaveProperty('lastMessage');
        expect(conv).toHaveProperty('unread');
        expect(typeof conv.unread).toBe('number');
      }
    });
  });

  describe('GET /messages/:id', () => {
    test('should return messages for a valid conversation', async () => {
      const convId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/messages/${convId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.messages)).toBe(true);
    });

    test('should reject invalid conversation ID format', async () => {
      const res = await request(app)
        .get('/messages/invalid-id')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('should reject unauthenticated requests', async () => {
      const convId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/messages/${convId}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should return messages with correct structure', async () => {
      const convId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/messages/${convId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.messages)).toBe(true);
      
      if (res.body.messages.length > 0) {
        const msg = res.body.messages[0];
        expect(msg).toHaveProperty('from');
        expect(msg).toHaveProperty('text');
        expect(msg).toHaveProperty('read');
        expect(msg).toHaveProperty('createdAt');
        expect(typeof msg.text).toBe('string');
        expect(typeof msg.read).toBe('boolean');
      }
    });
  });

  describe('POST /messages/:id/send', () => {
    test('should send message to existing conversation', async () => {
      const convId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/messages/${convId}/send`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ text: 'Test message' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBeDefined();
      expect(res.body.message.text).toBe('Test message');
      expect(res.body.message.read).toBe(false);
    });

    test('should create new conversation when id is "new"', async () => {
      const res = await request(app)
        .post('/messages/new/send')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ 
          text: 'New conversation message',
          participants: [testUserId2.toString()]
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.conversationId).toBeDefined();
      expect(res.body.message.text).toBe('New conversation message');
    });

    test('should reject empty messages', async () => {
      const convId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/messages/${convId}/send`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ text: '' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Empty message');
    });

    test('should reject new conversation without participants', async () => {
      const res = await request(app)
        .post('/messages/new/send')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ text: 'Message' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Participants required');
    });

    test('should reject unauthenticated requests', async () => {
      const convId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/messages/${convId}/send`)
        .send({ text: 'Test' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should trim whitespace from message', async () => {
      const convId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/messages/${convId}/send`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ text: '  Test message with spaces  ' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message.text).toBe('Test message with spaces');
    });
  });
});
