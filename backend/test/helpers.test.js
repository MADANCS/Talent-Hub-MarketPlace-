import { describe, it, expect } from 'vitest';
import { getPlanFeatures, generateToken } from '../utils/helpers';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'testsecret';

describe('Helper Functions', () => {
  it('should generate a valid JWT token', () => {
    const token = generateToken('user123', 'ADMIN');
    expect(token).toBeDefined();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('user123');
    expect(decoded.role).toBe('ADMIN');
  });

  it('should return correct features for FREE plan', () => {
    const features = getPlanFeatures('FREE');
    expect(features.jobPostings).toBe(3);
    expect(features.aiMatching).toBe(false);
  });

  it('should return correct features for PRO plan', () => {
    const features = getPlanFeatures('PRO');
    expect(features.jobPostings).toBe(25);
    expect(features.aiMatching).toBe(true);
  });

  it('should return correct features for ENTERPRISE plan', () => {
    const features = getPlanFeatures('ENTERPRISE');
    expect(features.jobPostings).toBe(-1); // Unlimited
    expect(features.aiMatching).toBe(true);
    expect(features.prioritySupport).toBe(true);
  });
});
