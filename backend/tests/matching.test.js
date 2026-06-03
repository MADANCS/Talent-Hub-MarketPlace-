import { describe, it, expect } from 'vitest';
const { calculateAIMatch } = require('../utils/helpers');

describe('AI Matching Engine', () => {
  const mockJob = {
    title: 'Senior React Developer',
    skills: ['React', 'Node.js', 'TypeScript'],
    experienceYears: 5,
    location: 'Remote',
    isRemote: true
  };

  const mockCandidate = {
    skills: ['React', 'Node.js', 'JavaScript'],
    experience: [
      { from: '2019-01-01', to: '2024-01-01' } // 5 years
    ],
    location: 'New York'
  };

  it('should calculate a high match score for ideal candidates', async () => {
    const result = await calculateAIMatch(mockJob, mockCandidate);
    expect(result.overallFit).toBe('Excellent Fit');
    expect(result.skillsMatch).toBeGreaterThan(60);
    expect(result.experienceMatch).toBeGreaterThan(80);
  });

  it('should identify skill gaps correctly', async () => {
    const poorCandidate = {
      skills: ['Python'],
      experience: [],
      location: 'London'
    };
    const result = await calculateAIMatch(mockJob, poorCandidate);
    expect(result.overallFit).toBe('Partial Fit');
    expect(result.gaps).toContainEqual(expect.stringContaining('Missing core skills'));
  });

  it('should handle remote preference matches', async () => {
    const result = await calculateAIMatch(mockJob, mockCandidate);
    expect(result.strengths).toContainEqual(expect.stringContaining('Optimal location alignment'));
  });
});
