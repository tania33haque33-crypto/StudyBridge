const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Application = require('../../models/Application');
const University = require('../../models/University');
const User = require('../../models/User');

describe('Application Controller', () => {
  let authToken;
  let userId;
  let testUniversity;
  let testApplication;

  beforeAll(async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'applicant@test.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'Applicant'
      });
    
    authToken = userRes.body.data.token;
    userId = userRes.body.data.user.id;
  });

  beforeEach(async () => {
    await Application.deleteMany({});
    await University.deleteMany({});

    testUniversity = await University.create({
      name: 'Application Test University',
      slug: 'application-test-university',
      country: 'USA',
      city: 'Boston',
      universityType: 'Private',
      overview: { description: 'Test university' },
      programs: [{
        name: 'Computer Science',
        level: 'Postgraduate',
        duration: '2 years'
      }],
      isActive: true
    });

    testApplication = await Application.create({
      userId,
      universityId: testUniversity._id,
      programId: testUniversity.programs[0]._id,
      programName: 'Computer Science',
      intake: 'Fall',
      intakeYear: 2025,
      deadline: new Date('2025-01-15'),
      status: 'Not Started'
    });
  });

  afterAll(async () => {
    await Application.deleteMany({});
    await University.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/applications', () => {
    test('should create new application', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          universityId: testUniversity._id,
          programId: testUniversity.programs[0]._id,
          intake: 'Spring',
          intakeYear: 2025,
          deadline: '2025-06-15'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('applicationNumber');
      expect(res.body.data.status).toBe('Not Started');
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/applications')
        .send({
          universityId: testUniversity._id,
          programId: testUniversity.programs[0]._id,
          intake: 'Spring',
          intakeYear: 2025,
          deadline: '2025-06-15'
        });

      expect(res.statusCode).toBe(401);
    });

    test('should fail with invalid university', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          universityId: fakeId,
          programId: 'program123',
          intake: 'Spring',
          intakeYear: 2025,
          deadline: '2025-06-15'
        });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/applications', () => {
    test('should get all user applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('should filter by status', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'Not Started' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(app => app.status === 'Not Started')).toBe(true);
    });
  });

  describe('GET /api/applications/:id', () => {
    test('should get application by ID', async () => {
      const res = await request(app)
        .get(`/api/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(testApplication._id.toString());
    });

    test('should not get other user application', async () => {
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@test.com',
          password: 'Test@123456',
          firstName: 'Other',
          lastName: 'User'
        });

      const res = await request(app)
        .get(`/api/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${otherUserRes.body.data.token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    test('should update application status', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testApplication._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'In Progress' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('In Progress');
      expect(res.body.data.statusHistory.length).toBeGreaterThan(0);
    });

    test('should update timeline on submission', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testApplication._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Submitted' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.timeline.submitted).toBeDefined();
    });
  });

  describe('POST /api/applications/:id/notes', () => {
    test('should add note to application', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplication._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test note content' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.content).toBe('Test note content');
    });
  });

  describe('GET /api/applications/stats', () => {
    test('should get application statistics', async () => {
      const res = await request(app)
        .get('/api/applications/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('byStatus');
    });
  });

  describe('GET /api/applications/upcoming-deadlines', () => {
    test('should get upcoming deadlines', async () => {
      const res = await request(app)
        .get('/api/applications/upcoming-deadlines')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    test('should delete application', async () => {
      const res = await request(app)
        .delete(`/api/applications/${testApplication._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);

      const deleted = await Application.findById(testApplication._id);
      expect(deleted).toBeNull();
    });
  });
});