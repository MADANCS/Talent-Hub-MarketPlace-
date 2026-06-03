import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlineStar,
  HiOutlineAcademicCap, HiOutlineGlobe, HiOutlineMail,
  HiOutlinePhone, HiOutlineCode, HiOutlineExternalLink,
  HiOutlineCalendar, HiOutlineBookmark, HiOutlineChatAlt2,
  HiOutlineSparkles, HiOutlineCheck, HiOutlineClock,
  HiOutlineChartBar, HiOutlineCurrencyRupee, HiOutlineDownload,
  HiOutlineShare, HiOutlineHeart, HiOutlineEye
} from 'react-icons/hi';
import { SiGithub } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';

const PublicProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('experience');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getCandidateProfile(id);
        setProfile(res.data?.user || res.data?.candidate);
      } catch {
        // Mock data for demo
        setProfile({
          _id: id,
          name: 'Arjun Patel',
          email: 'arjun@example.com',
          phone: '+91 98765 43210',
          location: 'Bangalore, India',
          bio: 'Full-stack engineer with 6+ years building scalable web apps. Passionate about system design, performance optimization, and mentoring junior developers. Previously at Google and Flipkart.',
          avatar: '',
          isOpenToWork: true,
          profileCompleteness: 92,
          aiMatchScore: 87,
          profileViews: 342,
          searchAppearances: 1247,
          skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Redis', 'Python'],
          experience: [
            { title: 'Senior Software Engineer', company: 'Google', location: 'Bangalore', from: '2022-01-01', current: true, description: 'Leading frontend architecture for Google Cloud Console. Built real-time collaboration features serving 10M+ users.' },
            { title: 'Full Stack Developer', company: 'Flipkart', location: 'Bangalore', from: '2019-06-01', to: '2021-12-31', description: 'Developed high-throughput payment processing system handling ₹500Cr+ daily transactions. Reduced checkout latency by 40%.' },
            { title: 'Software Engineer', company: 'Infosys', location: 'Pune', from: '2017-07-01', to: '2019-05-31', description: 'Built enterprise CRM modules using React and Java Spring Boot.' },
          ],
          education: [
            { degree: 'B.Tech', field: 'Computer Science', institution: 'IIT Delhi', from: '2013', to: '2017', grade: '8.9 CGPA' },
          ],
          expectedSalary: 3500000,
          linkedinUrl: 'https://linkedin.com/in/arjunpatel',
          githubUrl: 'https://github.com/arjunpatel',
          portfolioUrl: 'https://arjunpatel.dev',
          jobPreferences: { jobType: 'Full-time', remotePreference: 'Hybrid', preferredLocations: ['Bangalore', 'Remote'], preferredIndustries: ['Technology', 'Fintech'] },
          gamification: { level: 7, experience: 2400, rank: 'Expert', badges: [
            { name: 'Fast Responder', icon: '⚡', description: 'Responded to 95% of messages within 24 hours' },
            { name: 'Top Coder', icon: '🏆', description: 'Scored 90+ in 5 coding interviews' },
            { name: 'Profile Pro', icon: '🌟', description: 'Profile completeness above 90%' },
          ], streak: 14 },
          createdAt: '2023-01-15',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500">Profile not found</p>
      </div>
    );
  }

  const isOwn = currentUser?._id === id;
  const isRecruiter = currentUser?.role === 'RECRUITER' || currentUser?.role === 'ADMIN';

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const TABS = [
    { id: 'experience', label: 'Experience', icon: <HiOutlineBriefcase size={14} /> },
    { id: 'education', label: 'Education', icon: <HiOutlineAcademicCap size={14} /> },
    { id: 'skills', label: 'Skills', icon: <HiOutlineCode size={14} /> },
    { id: 'badges', label: 'Achievements', icon: <HiOutlineStar size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Cover + Profile Header */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-48 md:h-56 bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(139,92,246,0.3) 0%, transparent 50%)' }} />
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        {/* Profile card */}
        <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center border-4 border-slate-900 shadow-xl">
                  {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full rounded-3xl object-cover" /> :
                    <span className="text-4xl font-black text-white">{profile.name?.[0]}</span>}
                </div>
                {profile.isOpenToWork && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full border-2 border-slate-900 shadow-lg">
                    Open to Work
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{profile.name}</h1>
                    <p className="text-sm text-slate-300 mb-2">
                      {profile.experience?.[0]?.title}{profile.experience?.[0]?.company ? ` at ${profile.experience[0].company}` : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      {profile.location && <span className="flex items-center gap-1"><HiOutlineLocationMarker size={12} /> {profile.location}</span>}
                      {profile.gamification && <span className="flex items-center gap-1"><HiOutlineStar size={12} className="text-amber-400" /> Level {profile.gamification.level} · {profile.gamification.rank}</span>}
                      {profile.gamification?.streak > 0 && <span className="flex items-center gap-1">🔥 {profile.gamification.streak}-day streak</span>}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-2 shrink-0">
                    {isRecruiter && !isOwn && (
                      <>
                        <button onClick={() => toast.success('Connection request sent!')}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5">
                          <HiOutlineChatAlt2 size={14} /> Connect
                        </button>
                        <button onClick={() => navigate(`/interview/lobby/${id}`)}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center gap-1.5">
                          <HiOutlineCalendar size={14} /> Schedule
                        </button>
                      </>
                    )}
                    {isOwn && (
                      <Link to="/profile/edit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
                        Edit Profile
                      </Link>
                    )}
                    <button className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-white/5 transition-all text-slate-400">
                      <HiOutlineShare size={14} />
                    </button>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && <p className="text-sm text-slate-300 leading-relaxed mt-4 max-w-2xl">{profile.bio}</p>}

                {/* Links */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      <FaLinkedin size={12} /> LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5">
                      <SiGithub size={12} /> GitHub
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-500/20">
                      <HiOutlineGlobe size={12} /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Profile Score', value: `${profile.profileCompleteness || 0}%`, icon: <HiOutlineChartBar size={16} />, color: 'indigo' },
            { label: 'AI Match', value: `${profile.aiMatchScore || 0}%`, icon: <HiOutlineSparkles size={16} />, color: 'violet' },
            { label: 'Profile Views', value: profile.profileViews || 0, icon: <HiOutlineEye size={16} />, color: 'blue' },
            { label: 'Appearances', value: profile.searchAppearances || 0, icon: <HiOutlineGlobe size={16} />, color: 'emerald' },
            { label: 'Expected CTC', value: profile.expectedSalary ? `₹${(profile.expectedSalary / 100000).toFixed(0)}L` : 'N/A', icon: <HiOutlineCurrencyRupee size={16} />, color: 'amber' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-center">
              <div className={`w-8 h-8 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mx-auto mb-2 text-${stat.color}-400`}>
                {stat.icon}
              </div>
              <p className="text-lg font-black text-white">{stat.value}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="max-w-5xl mx-auto px-6 mt-8 pb-20">
        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-900 border border-white/5 rounded-2xl p-1.5 mb-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            {profile.experience?.map((exp, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-indigo-500/20 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <HiOutlineBriefcase size={20} className="text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{exp.title}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <HiOutlineClock size={10} />
                      {formatDate(exp.from)} — {exp.current ? <span className="text-emerald-400 font-bold">Present</span> : formatDate(exp.to)}
                    </p>
                    {exp.description && <p className="text-xs text-slate-400 leading-relaxed mt-3">{exp.description}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
            {!profile.experience?.length && <p className="text-center text-slate-600 py-10">No experience added yet</p>}
          </div>
        )}

        {/* Education */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            {profile.education?.map((edu, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <HiOutlineAcademicCap size={20} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{edu.degree} in {edu.field}</h3>
                    <p className="text-xs text-violet-400 font-medium">{edu.institution}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{edu.from} — {edu.to}</p>
                    {edu.grade && <p className="text-[10px] text-slate-400 mt-1">Grade: <span className="text-white font-bold">{edu.grade}</span></p>}
                  </div>
                </div>
              </motion.div>
            ))}
            {!profile.education?.length && <p className="text-center text-slate-600 py-10">No education added yet</p>}
          </div>
        )}

        {/* Skills */}
        {activeTab === 'skills' && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Technical Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, i) => (
                <motion.span key={skill} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="px-4 py-2 bg-slate-800 border border-white/5 rounded-xl text-xs font-bold text-slate-200 hover:border-indigo-500/30 hover:text-indigo-400 transition-all cursor-default">
                  {skill}
                </motion.span>
              ))}
            </div>
            {profile.jobPreferences && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Preferences</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  {profile.jobPreferences.jobType && <span className="bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5">📋 {profile.jobPreferences.jobType}</span>}
                  {profile.jobPreferences.remotePreference && <span className="bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5">🏠 {profile.jobPreferences.remotePreference}</span>}
                  {profile.jobPreferences.preferredLocations?.map(l => (
                    <span key={l} className="bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5">📍 {l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.gamification?.badges?.map((badge, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center hover:border-amber-500/20 transition-all">
                <span className="text-4xl block mb-3">{badge.icon}</span>
                <h4 className="text-sm font-bold text-white mb-1">{badge.name}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{badge.description}</p>
              </motion.div>
            ))}
            {!profile.gamification?.badges?.length && <p className="text-center text-slate-600 py-10 col-span-3">No badges earned yet</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
