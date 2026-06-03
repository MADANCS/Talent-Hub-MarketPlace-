/** Portfolio & ATS content — aligned with implemented features in this repo */

export const TECH_STACK = [
  'React 19',
  'Node.js',
  'Express.js',
  'MongoDB',
  'MERN Stack',
  'JavaScript',
  'REST APIs',
  'JWT Auth',
  'Socket.IO',
  'Redis',
  'Tailwind CSS',
  'Vite',
  'Google Gemini AI',
  'Agora RTC',
  'Razorpay',
  'Stripe',
  'Framer Motion',
  'Chart.js',
  'Vitest',
  'Helmet.js',
];

export const PLATFORM_FEATURES = [
  {
    title: 'AI Resume Parsing & Job Matching',
    description:
      'Gemini-powered PDF resume extraction and skill-based candidate–job fit scoring with gap analysis.',
    keywords: ['Artificial Intelligence', 'NLP', 'HR Tech', 'Matching Algorithm'],
  },
  {
    title: 'Role-Based Access Control (RBAC)',
    description:
      'Secure multi-tenant flows for Candidates, Recruiters, and Admins with JWT authentication and protected routes.',
    keywords: ['JWT', 'Authentication', 'Authorization', 'Security'],
  },
  {
    title: 'Real-Time Collaboration',
    description:
      'Socket.IO for live notifications, messaging, interview code sync, and platform analytics updates.',
    keywords: ['WebSockets', 'Real-Time Systems', 'Event-Driven Architecture'],
  },
  {
    title: 'Live Technical Interviews',
    description:
      'Agora video rooms with collaborative code editor for remote technical screening and pair programming.',
    keywords: ['Video API', 'Remote Interview', 'Full-Stack Development'],
  },
  {
    title: 'Subscription & Payments',
    description:
      'Razorpay and Stripe integrations for recruiter subscription tiers and secure checkout flows.',
    keywords: ['Payment Gateway', 'FinTech Integration', 'SaaS'],
  },
  {
    title: 'Production-Ready API Layer',
    description:
      'Express REST APIs with rate limiting, Helmet, compression, validation, Winston logging, and Vitest unit tests.',
    keywords: ['REST API', 'Backend Development', 'API Security', 'Testing'],
  },
];

export const RESUME_BULLETS = [
  'Architected and deployed a full-stack AI talent marketplace (MERN) with JWT-based RBAC for 3 user roles—Candidate, Recruiter, and Admin—supporting end-to-end hiring workflows.',
  'Built an AI matching engine using Google Gemini for resume parsing (PDF) and intelligent job–candidate fit scoring with skill-gap analysis; covered with Vitest unit tests.',
  'Implemented real-time features via Socket.IO: live job alerts, in-app messaging, interview code synchronization, and dynamic platform statistics on the landing page.',
  'Integrated Agora RTC for live video technical interviews with a collaborative code editor, enabling remote screening without third-party interview tools.',
  'Designed secure REST APIs (Express 5) with Helmet, rate limiting, bcrypt hashing, express-validator, and Redis-ready caching patterns for scalable request handling.',
  'Delivered a responsive React 19 UI (Tailwind CSS, Framer Motion, lazy routes) including dashboards, job search, market intelligence charts, and Razorpay/Stripe billing.',
];

export const ATS_KEYWORDS = [
  'Full-Stack Developer',
  'Software Engineer',
  'MERN Stack',
  'React.js',
  'Node.js',
  'Express.js',
  'MongoDB',
  'RESTful API',
  'JavaScript',
  'TypeScript',
  'JWT Authentication',
  'Socket.IO',
  'Real-Time Web Applications',
  'AI Integration',
  'Machine Learning',
  'Agile',
  'Git',
  'Tailwind CSS',
  'Responsive Web Design',
  'API Development',
  'Database Design',
  'Cloud-Ready',
  'Payment Integration',
  'Unit Testing',
  'SDLC',
  'Problem Solving',
  'System Design',
  'Microservices-Ready',
  'HR Tech',
  'SaaS',
];

export const IMPACT_METRICS = [
  { value: '15+', label: 'API Modules', detail: 'Auth, jobs, applications, interviews, subscriptions' },
  { value: '3', label: 'User Roles', detail: 'Candidate · Recruiter · Admin dashboards' },
  { value: '6+', label: 'Real-Time Events', detail: 'Jobs, chat, notifications, interviews, stats' },
  { value: '2', label: 'AI Providers', detail: 'Google Gemini & Anthropic SDK integration' },
];
