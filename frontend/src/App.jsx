import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';
import Footer from './components/layout/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { BASE_URL } from './services/api';

// ── Existing Pages ────────────────────────────────────────
const Home                  = lazy(() => import('./pages/Home/index'));
const ProjectShowcase       = lazy(() => import('./pages/About/ProjectShowcase'));
const Login                 = lazy(() => import('./pages/Auth/Login'));
const Register              = lazy(() => import('./pages/Auth/Register'));
const CandidateDashboard    = lazy(() => import('./pages/Candidate/Dashboard'));
const Leaderboard           = lazy(() => import('./pages/Candidate/Leaderboard'));
const RecruiterDashboard    = lazy(() => import('./pages/Recruiter/Dashboard'));
const AdminDashboard        = lazy(() => import('./pages/Admin/Dashboard'));
const JobSearch             = lazy(() => import('./pages/Jobs/Search'));
const JobDetails            = lazy(() => import('./pages/Jobs/Details'));
const MarketIntelligence    = lazy(() => import('./pages/Jobs/MarketIntelligence'));
const PostJob               = lazy(() => import('./pages/Recruiter/PostJob'));
const EditProfile           = lazy(() => import('./pages/User/EditProfile'));
const CandidateApplications = lazy(() => import('./pages/Candidate/Applications'));
const RecruiterApplications = lazy(() => import('./pages/Recruiter/Applications'));
const ManageJobs            = lazy(() => import('./pages/Recruiter/ManageJobs'));
const Pricing               = lazy(() => import('./pages/Subscription/Pricing'));
const SubscriptionManagement= lazy(() => import('./pages/Subscription/SubscriptionManagement'));
const Messages              = lazy(() => import('./pages/Messages/Messages'));

// ── Interview ─────────────────────────────────────────────
const LiveInterviewRoom     = lazy(() => import('./pages/Interview/LiveInterviewRoom'));
const InterviewLobby        = lazy(() => import('./pages/Interview/InterviewLobby'));

// ── LinkedIn / Indeed-style Platform Pages ────────────────
const TalentSearch          = lazy(() => import('./pages/Candidate/TalentSearch'));
const PublicProfile         = lazy(() => import('./pages/Candidate/PublicProfile'));
const JobFeed               = lazy(() => import('./pages/Jobs/JobFeed'));
const CandidatePipeline     = lazy(() => import('./pages/Recruiter/CandidatePipeline'));

// ── Extra Features ────────────────────────────────────────
const SavedJobs             = lazy(() => import('./pages/Candidate/SavedJobs'));
const RecruiterAnalytics    = lazy(() => import('./pages/Recruiter/RecruiterAnalytics'));

// ── Socket (global app-level) ─────────────────────────────
const SOCKET_URL = BASE_URL.replace('/api', '');

const App = () => {
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?._id) {
      socket.emit('join', user._id);
    }

    // ── Global real-time notifications ──────────────────────
    socket.on('new_job_posted', (job) => {
      toast.success(
        <div className="flex flex-col gap-0.5">
          <strong className="text-slate-900 font-bold text-sm">🆕 {job.title}</strong>
          <p className="text-xs text-slate-600">{job.company} posted a new role</p>
        </div>,
        { duration: 5000 }
      );
    });

    socket.on('application_update', (data) => {
      toast.success(
        <div className="flex flex-col gap-0.5">
          <strong className="text-slate-900 font-bold text-sm">📋 Application Update</strong>
          <p className="text-xs text-slate-600">{data.message}</p>
        </div>,
        { duration: 6000, icon: '🚀' }
      );
    });

    socket.on('interview_scheduled', (data) => {
      toast(
        <div className="flex flex-col gap-0.5">
          <strong className="text-amber-700 font-bold text-sm">📅 Interview Scheduled</strong>
          <p className="text-xs text-slate-600">{data.jobTitle} · {new Date(data.scheduledAt).toLocaleString()}</p>
        </div>,
        { duration: 8000, icon: '📅' }
      );
    });

    socket.on('platform_stats_update', () => {
      // Silently update stats — consumed by Home page via its own socket
    });

    socket.on('new_talent_activity', (u) => {
      toast(
        <div className="flex flex-col gap-0.5">
          <strong className="text-slate-900 font-bold text-sm">👤 {u.name}</strong>
          <p className="text-xs text-slate-600">{u.action?.toLowerCase()}</p>
        </div>,
        { duration: 4000 }
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <ThemeProvider>
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            fontWeight: '500',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
      <Navbar />
      <main className="min-h-screen">
        <Suspense fallback={<LoadingSpinner fullPage />}>
          <Routes>

            {/* ── Public Routes ───────────────────────────────── */}
            <Route path="/"                     element={<Home />} />
            <Route path="/login"                element={<Login />} />
            <Route path="/register"             element={<Register />} />
            <Route path="/jobs"                 element={<JobSearch />} />
            <Route path="/jobs/:id"             element={<JobDetails />} />
            <Route path="/market-intelligence"  element={<MarketIntelligence />} />
            <Route path="/pricing"              element={<Pricing />} />
            <Route path="/about"                element={<ProjectShowcase />} />

            {/* ── Public Profile (LinkedIn-style) ─────────────── */}
            <Route path="/profile/:id"          element={<PublicProfile />} />

            {/* ── Talent Search (public for recruiters, filtered for candidates) ── */}
            <Route path="/talent-search"        element={<TalentSearch />} />

            {/* ── Job Feed (AI curated — auth preferred) ──────── */}
            <Route path="/jobs/feed"            element={<JobFeed />} />

            {/* ── Shared Authenticated Routes (all logged-in roles) ───── */}
            <Route element={<ProtectedRoute allowedRoles={['CANDIDATE', 'RECRUITER', 'ADMIN']} />}>
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/messages"     element={<Messages />} />
            </Route>

            {/* ── Candidate Routes ─────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
              <Route path="/candidate/dashboard"    element={<CandidateDashboard />} />
              <Route path="/candidate/applications" element={<CandidateApplications />} />
              <Route path="/candidate/leaderboard"  element={<Leaderboard />} />
              <Route path="/candidate/saved-jobs"   element={<SavedJobs />} />
              <Route path="/my-feed"                element={<JobFeed />} />
            </Route>

            {/* ── Shared Interview Routes ──────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['CANDIDATE', 'RECRUITER', 'ADMIN']} />}>
              <Route path="/interview/lobby/:id"    element={<InterviewLobby />} />
              <Route path="/interview/:id"          element={<LiveInterviewRoom />} />
            </Route>

            {/* ── Recruiter Routes ─────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']} />}>
              <Route path="/recruiter/dashboard"    element={<RecruiterDashboard />} />
              <Route path="/recruiter/analytics"    element={<RecruiterAnalytics />} />
              <Route path="/recruiter/jobs"         element={<ManageJobs />} />
              <Route path="/recruiter/applications" element={<RecruiterApplications />} />
              <Route path="/recruiter/post-job"     element={<PostJob />} />
              <Route path="/recruiter/subscription" element={<SubscriptionManagement />} />
              <Route path="/recruiter/pipeline"     element={<CandidatePipeline />} />
              <Route path="/recruiter/talent"       element={<TalentSearch />} />
            </Route>

            {/* ── Admin Routes ─────────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* ── 404 ──────────────────────────────────────────── */}
            <Route path="*" element={
              <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
                <div className="text-8xl font-black bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-4">404</div>
                <p className="text-slate-400 text-lg font-medium mb-8">This page doesn't exist</p>
                <a href="/" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors">
                  Go Home
                </a>
              </div>
            } />

          </Routes>
        </Suspense>
      </main>
      <Footer />
    </Router>
    </ThemeProvider>
  );
};

export default App;