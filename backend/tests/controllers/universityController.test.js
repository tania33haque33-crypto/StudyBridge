const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const University = require('../../models/University');
const User = require('../../models/User');

describe('University Controller', () => {
  let authToken;
  let adminToken;
  let testUniversity;

  beforeAll(async () => {
    // Create test student user
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@test.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'Student'
      });
    authToken = studentRes.body.data.token;

    // Create admin user
    const admin = await User.create({
      email: 'admin@test.com',
      password: 'Admin@123456',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true
    });
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
  });

  beforeEach(async () => {
    await University.deleteMany({});
    
    testUniversity = await University.create({
      name: 'Test University',
      slug: 'test-university',
      country: 'USA',
      city: 'Boston',
      universityType: 'Private',
      overview: {
        description: 'A test university for testing purposes'
      },
      rankings: {
        qsRanking: { world: 50, country: 10 }
      },
      stats: {
        totalStudents: 15000,
        acceptanceRate: 15,
        employmentRate: 90
      },
      tuitionFees: {
        undergraduate: {
          international: { amount: 50000, currency: 'USD' }
        }
      },
      isActive: true
    });
  });

  afterAll(async () => {
    await University.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/universities', () => {
    test('should get all universities with pagination', async () => {
      const res = await request(app)
        .get('/api/universities')
        .query({ page: 1, limit: 20 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pages');
    });

    test('should filter universities by country', async () => {
      const res = await request(app)
        .get('/api/universities')
        .query({ country: 'USA' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].country).toBe('USA');
    });
  });

  describe('GET /api/universities/search', () => {
    test('should search universities by name', async () => {
      const res = await request(app)
        .get('/api/universities/search')
        .query({ q: 'Test' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('should filter by tuition range', async () => {
      const res = await request(app)
        .get('/api/universities/search')
        .query({ minTuition: 40000, maxTuition: 60000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('should filter by QS ranking', async () => {
      const res = await request(app)
        .get('/api/universities/search')
        .query({ qsRankingMin: 1, qsRankingMax: 100 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/universities/:id', () => {
    test('should get university by ID', async () => {
      const res = await request(app)
        .get(`/api/universities/${testUniversity._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test University');
    });

    test('should return 404 for non-existent university', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/universities/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/universities/slug/:slug', () => {
    test('should get university by slug', async () => {
      const res = await request(app)
        .get('/api/universities/slug/test-university');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.slug).toBe('test-university');
    });
  });

  describe('POST /api/universities/compare', () => {
    test('should compare universities', async () => {
      const uni2 = await University.create({
        name: 'Second Test University',
        slug: 'second-test-university',
        country: 'UK',
        city: 'London',
        universityType: 'Public',
        overview: { description: 'Second test university' },
        isActive: true
      });

      const res = await request(app)
        .post('/api/universities/compare')
        .send({
          universityIds: [testUniversity._id, uni2._id]
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    test('should fail with less than 2 universities', async () => {
      const res = await request(app)
        .post('/api/universities/compare')
        .send({
          universityIds: [testUniversity._id]
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/universities (Admin)', () => {
    test('should create university as admin', async () => {
      const res = await request(app)
        .post('/api/universities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New University',
          country: 'Canada',
          city: 'Toronto',
          universityType: 'Public',
          overview: { description: 'New university' }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('New University');
    });

    test('should fail without admin token', async () => {
      const res = await request(app)
        .post('/api/universities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New University',
          country: 'Canada',
          city: 'Toronto',
          universityType: 'Public'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/universities/:id (Admin)', () => {
    test('should update university as admin', async () => {
      const res = await request(app)
        .put(`/api/universities/${testUniversity._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated University Name'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Updated University Name');
    });
  });

  describe('DELETE /api/universities/:id (Admin)', () => {
    test('should delete university as admin', async () => {
      const res = await request(app)
        .delete(`/api/universities/${testUniversity._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);

      const deleted = await University.findById(testUniversity._id);
      expect(deleted).toBeNull();
    });
  });

  describe('POST /api/universities/:id/view', () => {
    test('should increment view count', async () => {
      const initialViews = testUniversity.viewCount;

      const res = await request(app)
        .post(`/api/universities/${testUniversity._id}/view`);

      expect(res.statusCode).toBe(200);

      const updated = await University.findById(testUniversity._id);
      expect(updated.viewCount).toBe(initialViews + 1);
    });
  });
});