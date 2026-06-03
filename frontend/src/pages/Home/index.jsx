import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiOutlineSearch, HiOutlineLocationMarker, HiOutlineBriefcase, 
  HiOutlineOfficeBuilding, HiOutlineSparkles,
  HiOutlineArrowRight, HiOutlineChatAlt2, HiOutlineShieldCheck,
  HiOutlineGlobe
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import ProjectHighlights from '../../components/home/ProjectHighlights';

const Home = () => {
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [stats, setStats] = useState({ activeJobs: 12450, talents: 8900, matches: 45600 });
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5050'
    );
    socket.on('platform_stats_update', (newStats) => {
      setStats(newStats);
    });
    return () => { socket.off('platform_stats_update'); socket.disconnect(); };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${what}&location=${where}`);
  };

  const categories = [
    { name: 'AI & Machine Learning', icon: HiOutlineSparkles },
    { name: 'Development', icon: HiOutlineBriefcase },
    { name: 'Design', icon: HiOutlineSparkles },
    { name: 'Cloud', icon: HiOutlineOfficeBuilding },
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">
            Full-Stack MERN · AI-Powered Hiring Platform
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            AI Talent Marketplace for <span className="text-blue-600">Modern Recruitment</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto mb-10">
            Production-style platform built with React, Node.js, Express, MongoDB, JWT authentication,
            Socket.IO real-time features, Google Gemini AI resume parsing, Agora live interviews,
            and Razorpay payments.
          </p>

          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg p-2">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 w-full relative">
                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Job title or keywords" 
                  className="w-full h-12 bg-transparent pl-12 pr-4 focus:outline-none text-slate-900"
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-slate-200" />
              <div className="flex-1 w-full relative">
                <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Location" 
                  className="w-full h-12 bg-transparent pl-12 pr-4 focus:outline-none text-slate-900"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                />
              </div>
              <button className="w-full md:w-auto h-12 px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                Search
              </button>
            </form>
          </div>

          <div className="mt-12 flex justify-center gap-10">
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.activeJobs.toLocaleString()}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.talents.toLocaleString()}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Talents</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Categories</h2>
            <Link to="/jobs" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
              Browse all <HiOutlineArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">
                  <cat.icon />
                </div>
                <h3 className="text-lg font-bold mb-1">{cat.name}</h3>
                <p className="text-slate-500 text-sm">Explore opportunities in this field.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Built for professionals</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <HiOutlineChatAlt2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold">Direct Messaging</h4>
                  <p className="text-slate-500 text-sm">Talk directly with recruiters and candidates.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <HiOutlineShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold">Verified Profiles</h4>
                  <p className="text-slate-500 text-sm">Every user is verified for quality assurance.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <HiOutlineGlobe size={20} />
                </div>
                <div>
                  <h4 className="font-bold">Global Opportunities</h4>
                  <p className="text-slate-500 text-sm">Find remote roles from across the globe.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-100 rounded-3xl aspect-video flex items-center justify-center overflow-hidden">
             <HiOutlineBriefcase size={80} className="text-slate-300" />
          </div>
        </div>
      </section>

      <ProjectHighlights />

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Explore the platform or view the portfolio brief</h2>
          <p className="text-blue-100 mb-8">
            Recruiters: see resume-ready bullets, tech stack, and ATS keywords on the project showcase page.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors">Get started</Link>
            <Link to="/about" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors border border-blue-500">Portfolio &amp; resume bullets</Link>
            <Link to="/jobs" className="bg-transparent text-white px-8 py-3 rounded-lg font-bold border border-white/40 hover:bg-white/10 transition-colors">Browse jobs</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
