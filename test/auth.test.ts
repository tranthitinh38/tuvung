import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { app } from '../server';
import { userStore } from '../src/store/userStore';
import nodemailer from 'nodemailer';

// Mock nodemailer transporter
vi.mock('nodemailer', () => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'test-id' });
  const createTransport = vi.fn(() => ({ sendMail: sendMailMock }));
  return { createTransport, __esModule: true };
});

describe('Auth Endpoints', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'Password123!';

  afterAll(() => {
    // Clean up in-memory store
    userStore.delete(testEmail);
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should initiate forgot password and send email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: testEmail });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const user = userStore.getByEmail(testEmail) as any;
    expect(user?.resetToken).toBeDefined();
    // Verify sendMail called
    const nodemailerModule = require('nodemailer');
    expect(nodemailerModule.createTransport).toHaveBeenCalled();
  });

  it('should reset password with valid token', async () => {
    const user = userStore.getByEmail(testEmail) as any;
    const token = user.resetToken;
    const newPass = 'NewPass123!';
    const res = await request(app).post('/api/auth/reset-password').send({ token, newPassword: newPass });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Login with new password
    const loginRes = await request(app).post('/api/auth/login').send({ email: testEmail, password: newPass });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });
});
