const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Lender = require('../../src/models/Lender');

// Create a test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', require('../../src/routes/auth'));
    return app;
};

describe('Auth API', () => {
    let app;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.username).toBe('testuser');
            expect(res.body.data.user.email).toBe('test@example.com');
            expect(res.body.data.token).toBeDefined();
        });

        it('should fail with duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'user1',
                    email: 'duplicate@example.com',
                    password: 'password123',
                });

            // Second registration with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'user2',
                    email: 'duplicate@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Email already registered');
        });

        it('should fail with duplicate username', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'sameuser',
                    email: 'first@example.com',
                    password: 'password123',
                });

            // Second registration with same username
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'sameuser',
                    email: 'second@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Username already taken');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            const lender = await Lender.create({
                businessName: 'Test Business',
                ownerName: 'Test Owner',
                email: 'login@example.com',
                phone: '+91-1234567890',
            });

            await User.create({
                username: 'loginuser',
                email: 'login@example.com',
                password: 'password123',
                lenderId: lender._id,
            });
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe('login@example.com');
            expect(res.body.data.token).toBeDefined();
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should fail without email or password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Please provide email and password');
        });
    });

    describe('GET /api/auth/me', () => {
        let token;

        beforeEach(async () => {
            // Register and get token
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'meuser',
                    email: 'me@example.com',
                    password: 'password123',
                });
            token = res.body.data.token;
        });

        it('should return current user with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe('me@example.com');
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.message).toContain('Not authorized');
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.status).toBe(401);
            expect(res.body.message).toContain('invalid');
        });
    });
});
