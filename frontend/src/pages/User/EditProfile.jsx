import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  HiOutlineUser, HiOutlineSave, HiOutlineUpload,
  HiOutlineCheckCircle, HiOutlineShieldCheck, HiOutlineViewGrid, 
  HiOutlineCollection, HiOutlineChat, HiOutlineIdentification, 
  HiOutlineMap, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed,
  HiOutlineSearch, HiOutlineUserGroup, HiOutlinePlus, HiOutlineBriefcase,
  HiOutlineLightningBolt, HiOutlineSparkles, HiOutlineChevronLeft
} from 'react-icons/hi';
import Sidebar from '../../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.isTwoFactorEnabled || false);

  const handleGenerate2FA = async () => {
    try {
      const res = await authAPI.generate2FA();
      setQrCodeUrl(res.data.qrCodeUrl);
    } catch (error) {
      toast.error('Failed to generate 2FA token');
    }
  };

  const handleEnable2FA = async () => {
    try {
      await authAPI.enable2FA(twoFactorToken);
      setTwoFactorEnabled(true);
      setQrCodeUrl('');
      toast.success('Two-factor authentication enabled');
      updateUser({ ...user, isTwoFactorEnabled: true });
    } catch (error) {
      toast.error('Invalid OTP token');
    }
  };
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    skills: [],
    experience: [],
    education: [],
    isOpenToWork: true,
  });

  const [newSkill, setNewSkill] = useState('');

  const dashboardLinks = user?.role === 'CANDIDATE' ? [
    { label: 'Overview', path: '/candidate/dashboard', icon: HiOutlineViewGrid },
    { label: 'Applications', path: '/candidate/applications', icon: HiOutlineCollection },
    { label: 'Messages', path: '/messages', icon: HiOutlineChat },
    { label: 'Profile', path: '/profile/edit', icon: HiOutlineIdentification },
    { label: 'Job Search', path: '/jobs', icon: HiOutlineSearch },
  ] : [
    { label: 'Overview', path: '/recruiter/dashboard', icon: HiOutlineViewGrid },
    { label: 'Jobs', path: '/recruiter/jobs', icon: HiOutlineBriefcase },
    { label: 'Candidates', path: '/recruiter/applications', icon: HiOutlineUserGroup },
    { label: 'Post a Job', path: '/recruiter/post-job', icon: HiOutlinePlus },
    { label: 'Messages', path: '/messages', icon: HiOutlineChat },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        const profile = res.data.user;
        setFormData({
          name: profile.name || '',
          bio: profile.bio || '',
          phone: profile.phone || '',
          location: profile.location || '',
          skills: profile.skills || [],
          experience: profile.experience || [],
          education: profile.education || [],
          isOpenToWork: profile.isOpenToWork ?? true,
        });
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('Syncing Profile...');
    try {
      const res = await userAPI.updateProfile(formData);
      updateUser(res.data.user);
      toast.success('Neural Profile Synchronized', { id: toastId });
      navigate(-1);
    } catch (error) {
      toast.error('Sync Failed', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);

    const uploadData = new FormData();
    uploadData.append('resume', file);

    try {
      const res = await userAPI.parseResume(uploadData);
      const parsed = res.data.data;
      
      setFormData(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        phone: parsed.phone || prev.phone,
        location: parsed.location || prev.location,
        bio: parsed.bio || prev.bio,
        skills: parsed.skills?.length > 0 ? parsed.skills : prev.skills,
        experience: parsed.experience?.length > 0 ? parsed.experience : prev.experience,
        education: parsed.education?.length > 0 ? parsed.education : prev.education,
      }));
      setIsScanning(false);
      toast.success('Neural Extraction Complete');
    } catch (error) {
      setIsScanning(false);
      toast.error('Extraction Failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Accessing Personal Core...</p>
       </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={dashboardLinks} />

      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
          >
            <div className="text-center relative">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-8 shadow-[0_0_50px_rgba(0,136,255,0.3)]"
              />
              <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">Neural Extraction</h3>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-4">Processing Artifacts...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto px-8 py-10 relative selection:bg-primary/20 selection:text-primary">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-10 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden"
          >
             <div className="relative z-10">
               <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-4">
                 <HiOutlineIdentification /> Personal Identity
               </div>
               <h1 className="text-5xl font-black text-white font-outfit tracking-tighter mb-2">Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Profile</span></h1>
               <p className="text-slate-400 font-medium max-w-md leading-relaxed">Update your neural signature and professional history to enhance matching accuracy.</p>
             </div>
             
             <div className="relative z-10 flex gap-4">
               <button onClick={() => navigate(-1)} className="px-8 py-4 bg-slate-950 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all active:scale-95">
                 Abort
               </button>
               <button onClick={handleSave} disabled={isSaving} className="px-10 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95 flex items-center gap-2">
                 {isSaving ? 'Syncing...' : <><HiOutlineSave /> Commit Sync</>}
               </button>
             </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Avatar & Quick Stats */}
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl flex flex-col items-center text-center group"
              >
                <div className="relative mb-6">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-32 h-32 rounded-[40px] bg-slate-950 border-4 border-white/5 flex items-center justify-center text-5xl font-black text-slate-700 shadow-2xl relative z-10 group-hover:text-primary transition-colors">
                     {formData.name ? formData.name[0].toUpperCase() : <HiOutlineUser />}
                   </div>
                </div>
                <h2 className="text-2xl font-black text-white font-outfit tracking-tight">{formData.name || 'Anonymous User'}</h2>
                <div className="px-3 py-1 bg-slate-950 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                  {user.role} Protocol
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="mt-8 flex items-center gap-3 bg-slate-950/50 px-6 py-3 rounded-2xl border border-white/5 cursor-pointer"
                  onClick={() => setFormData({ ...formData, isOpenToWork: !formData.isOpenToWork })}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${formData.isOpenToWork ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${formData.isOpenToWork ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {formData.isOpenToWork ? 'Active Matchmaking' : 'Matchmaking Halted'}
                  </span>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                   <HiOutlineLightningBolt size={100} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <HiOutlineUpload className="text-primary" /> Artifact Parsing
                </h3>
                <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">
                  Feed your latest PDF/DOC artifacts to the neural engine for automated profile synchronization.
                </p>
                <label className="block w-full text-center px-6 py-4 bg-slate-950 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:border-primary/50 transition-all cursor-pointer">
                  Load Artifact
                  <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleResumeUpload} />
                </label>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden group"
              >
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <HiOutlineShieldCheck className="text-primary" /> Security Layer
                </h3>
                {twoFactorEnabled ? (
                  <div className="flex items-center gap-4 text-emerald-400 bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20">
                    <HiOutlineLockClosed size={24} />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest">Protocol Active</div>
                      <div className="text-[8px] text-emerald-500/60 font-bold uppercase">2FA Encrypted</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">Secure your identity with multi-factor authentication protocols.</p>
                    {!qrCodeUrl ? (
                      <button onClick={handleGenerate2FA} className="w-full px-6 py-4 bg-slate-950 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all">
                        Initialize 2FA
                      </button>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-4 bg-white rounded-3xl mx-auto inline-block">
                           <img src={qrCodeUrl} alt="2FA QR Code" className="w-32 h-32" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="000000"
                          className="w-full text-center tracking-[1em] text-2xl font-black bg-slate-950 border border-white/5 rounded-2xl py-4 focus:border-primary/50 outline-none text-white"
                          value={twoFactorToken}
                          onChange={(e) => setTwoFactorToken(e.target.value)}
                          maxLength={6}
                        />
                        <button onClick={handleEnable2FA} className="w-full px-6 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-primary/20">
                          Verify Token
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column: Form Sections */}
            <div className="lg:col-span-2 space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl space-y-10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-primary rounded-full" />
                  <h2 className="text-2xl font-black text-white font-outfit tracking-tight">Identity Parameters</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Callsign / Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Sector / Location</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Channel / Email</label>
                    <div className="relative group">
                       <HiOutlineMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" />
                       <input
                         type="email"
                         disabled
                         className="w-full bg-slate-950/50 border border-white/5 text-slate-700 rounded-2xl px-12 py-4 text-sm outline-none cursor-not-allowed italic"
                         value={user.email}
                       />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Direct Link / Phone</label>
                    <div className="relative group">
                       <HiOutlinePhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                       <input
                         type="tel"
                         className="w-full bg-slate-950 border border-white/5 rounded-2xl px-12 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                         value={formData.phone}
                         onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Neural Summary / Bio</label>
                  <textarea
                    rows={6}
                    className="w-full bg-slate-950 border border-white/5 rounded-[32px] px-8 py-6 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium resize-none leading-relaxed"
                    placeholder="Describe your technical architecture and mission history..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  ></textarea>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl space-y-10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-black text-white font-outfit tracking-tight">Skill Matrix</h2>
                </div>

                <div className="relative group">
                  <HiOutlineLightningBolt className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-12 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                    placeholder="Input technical competence (e.g. Kubernetes, React, Rust)..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill(e)}
                  />
                  <button onClick={addSkill} className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all rounded-xl">
                    Integrate
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <AnimatePresence>
                    {formData.skills.map((skill, i) => (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={i} 
                        className="px-5 py-2 bg-slate-950 border border-white/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group/skill"
                      >
                        {skill}
                        <button 
                          onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, idx) => idx !== i) })} 
                          className="text-slate-600 hover:text-red-500 transition-colors"
                        >
                          &times;
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {formData.skills.length === 0 && (
                    <div className="text-center py-10 w-full">
                       <div className="w-16 h-16 bg-slate-950 border border-dashed border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 opacity-20">
                          <HiOutlineSparkles size={32} />
                       </div>
                       <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Neural Matrix Empty</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
