import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  HiOutlineBriefcase, HiOutlineCheck, HiOutlinePlus, 
  HiOutlineTrash, HiOutlineChartBar, HiOutlineUsers,
  HiOutlineChat, HiOutlineAdjustments, HiOutlineChevronRight,
  HiOutlineChevronLeft, HiOutlineLightningBolt, HiOutlineSparkles
} from 'react-icons/hi';
import Sidebar from '../../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Mid',
    salaryMin: '',
    salaryMax: '',
    skills: [],
    requirements: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newReq, setNewReq] = useState('');

  const dashboardLinks = [
    { label: 'Overview', path: '/recruiter/dashboard', icon: HiOutlineChartBar },
    { label: 'Jobs', path: '/recruiter/jobs', icon: HiOutlineBriefcase },
    { label: 'Candidates', path: '/recruiter/applications', icon: HiOutlineUsers },
    { label: 'Post a Job', path: '/recruiter/post-job', icon: HiOutlinePlus },
    { label: 'Messages', path: '/messages', icon: HiOutlineChat },
  ];

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleAddReq = (e) => {
    e.preventDefault();
    if (newReq) {
      setFormData({ ...formData, requirements: [...formData.requirements, newReq] });
      setNewReq('');
    }
  };

  const handleAIDescription = async () => {
    if (!formData.title || formData.skills.length === 0) {
      toast.error('Job title and skills are required for AI generation.');
      return;
    }

    const loadingToast = toast.loading('Generating neural description...');
    try {
      const res = await jobAPI.generateDescription({ title: formData.title, skills: formData.skills });
      setFormData({ ...formData, description: res.data.description });
      toast.success('Description synthesized!', { id: loadingToast });
    } catch (error) {
      toast.error('Synthesis failed.', { id: loadingToast });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading('Broadcasting mission...');
    try {
      await jobAPI.createJob({
        ...formData,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
      });
      toast.success('Mission broadcasted successfully.', { id: toastId });
      navigate('/recruiter/dashboard');
    } catch (error) {
      toast.error('Broadcast failed.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: 'Parameters', icon: HiOutlineAdjustments },
    { id: 2, label: 'Skill Matrix', icon: HiOutlineLightningBolt },
    { id: 3, label: 'Neural Intel', icon: HiOutlineSparkles },
  ];

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={dashboardLinks} />

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
                 <HiOutlinePlus /> Mission Briefing
               </div>
               <h1 className="text-5xl font-black text-white font-outfit tracking-tighter mb-2">Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Position</span></h1>
               <p className="text-slate-400 font-medium max-w-md leading-relaxed">Establish a new operational requirement and deploy it to the global talent network.</p>
             </div>
             
             <div className="relative z-10 flex gap-3">
               {steps.map((s) => (
                 <div key={s.id} className="flex items-center group">
                   <motion.div 
                    animate={{ 
                      scale: step === s.id ? 1.1 : 1,
                      backgroundColor: step >= s.id ? '#0088ff' : '#0f172a'
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/10"
                   >
                     <s.icon size={20} />
                   </motion.div>
                   {s.id < 3 && <div className={`w-8 h-px mx-2 transition-colors duration-500 ${step > s.id ? 'bg-primary' : 'bg-slate-800'}`}></div>}
                 </div>
               ))}
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-xl p-12 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden relative"
          >
            <form onSubmit={handleSubmit} className="space-y-10">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-1.5 h-10 bg-primary rounded-full" />
                       <h2 className="text-2xl font-black text-white font-outfit tracking-tight">Core Parameters</h2>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mission Title</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                        placeholder="e.g. Lead Systems Architect"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location Protocol</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                          placeholder="Remote, NYC, London..."
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deployment Type</label>
                        <select 
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium appearance-none cursor-pointer"
                          value={formData.jobType}
                          onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seniority / Experience</label>
                        <select 
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium appearance-none cursor-pointer"
                          value={formData.experienceLevel}
                          onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                        >
                          <option value="Entry">Entry Level</option>
                          <option value="Mid">Mid Level</option>
                          <option value="Senior">Senior Level</option>
                          <option value="Lead">Lead / Manager</option>
                          <option value="Executive">Executive</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Compensation Range ($)</label>
                        <div className="flex gap-4">
                          <input
                            type="number"
                            required
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                            placeholder="Min"
                            value={formData.salaryMin}
                            onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                          />
                          <input
                            type="number"
                            required
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                            placeholder="Max"
                            value={formData.salaryMax}
                            onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-1.5 h-10 bg-emerald-500 rounded-full" />
                       <h2 className="text-2xl font-black text-white font-outfit tracking-tight">Competence Matrix</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Required Expertise</label>
                        <div className="relative">
                          <HiOutlineLightningBolt className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl px-12 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                            placeholder="e.g. React, Docker, Distributed Systems..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                          />
                          <button type="button" onClick={handleAddSkill} className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all rounded-xl">
                            Integrate
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {formData.skills.map((skill, i) => (
                          <motion.span 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            key={i} 
                            className="px-5 py-2 bg-slate-950 border border-white/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                          >
                            {skill}
                            <button type="button" onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, idx) => idx !== i) })} className="text-slate-600 hover:text-red-500 transition-colors">×</button>
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Key Operational Requirements</label>
                        <div className="relative">
                          <HiOutlinePlus className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl px-12 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white font-medium"
                            placeholder="e.g. Architect high-scale microservices"
                            value={newReq}
                            onChange={(e) => setNewReq(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddReq(e)}
                          />
                          <button type="button" onClick={handleAddReq} className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all rounded-xl">
                            Deploy
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {formData.requirements.map((req, i) => (
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            key={i} 
                            className="flex justify-between items-center p-5 bg-slate-950 border border-white/5 rounded-3xl group"
                          >
                            <span className="text-sm font-medium text-slate-300 flex items-center gap-4">
                               <HiOutlineCheck className="text-emerald-500" /> {req}
                            </span>
                            <button type="button" onClick={() => setFormData({ ...formData, requirements: formData.requirements.filter((_, idx) => idx !== i) })} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                              <HiOutlineTrash />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-1.5 h-10 bg-purple-500 rounded-full" />
                       <h2 className="text-2xl font-black text-white font-outfit tracking-tight">Mission Intelligence</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Intel / Description</label>
                        <button 
                          type="button" 
                          onClick={handleAIDescription}
                          className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-purple-500/20 transition-all flex items-center gap-2"
                        >
                          <HiOutlineSparkles /> Synchronize AI Intel
                        </button>
                      </div>
                      <textarea
                        required
                        rows={12}
                        className="w-full bg-slate-950 border border-white/5 rounded-[40px] px-10 py-8 text-sm focus:border-purple-500/50 outline-none transition-all text-white font-medium resize-none leading-relaxed"
                        placeholder="Provide deep intelligence on the role, team dynamics, and operational objectives..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-10 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} 
                  className="px-10 py-4 bg-slate-950 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all active:scale-95"
                >
                  {step === 1 ? 'Abort' : 'Revert Protocol'}
                </button>
                
                {step < 3 ? (
                  <button 
                    type="button" 
                    onClick={() => setStep(step + 1)} 
                    className="px-12 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-3"
                  >
                    Advance <HiOutlineChevronRight />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-12 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 active:scale-95 flex items-center gap-3"
                  >
                    {isSubmitting ? 'Broadcasting...' : 'Finalize Broadcast'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PostJob;
