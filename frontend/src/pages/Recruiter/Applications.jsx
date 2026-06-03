import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { applicationAPI } from '../../services/api';
import { 
  HiOutlineMail, HiOutlineLocationMarker, HiOutlineExternalLink, 
  HiOutlineSparkles, HiOutlineCheck, HiOutlineX, HiOutlineChatAlt,
  HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineBriefcase,
  HiOutlineChartBar, HiOutlinePlus, HiOutlineChat, HiOutlineChevronRight,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import InterviewEvaluationModal from './InterviewEvaluationModal';

const RecruiterApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [activeQuestions, setActiveQuestions] = useState(null); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [evaluatingInterview, setEvaluatingInterview] = useState(null);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get('job');

  const dashboardLinks = [
    { label: 'Overview', path: '/recruiter/dashboard', icon: HiOutlineChartBar },
    { label: 'Jobs', path: '/recruiter/jobs', icon: HiOutlineBriefcase },
    { label: 'Candidates', path: '/recruiter/applications', icon: HiOutlineUserGroup },
    { label: 'Post a Job', path: '/recruiter/post-job', icon: HiOutlinePlus },
    { label: 'Messages', path: '/messages', icon: HiOutlineChat },
  ];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let res;
      if (jobId) {
        res = await applicationAPI.getJobApplications(jobId, { status: filterStatus });
      } else {
        res = await applicationAPI.getRecruiterApplications({ status: filterStatus });
      }
      const apps = res.data?.applications || [];
      setApplications(apps);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, filterStatus]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await applicationAPI.updateStatus(appId, { status: newStatus });
      toast.success(`Application updated to: ${newStatus}`);
      fetchApplications();
      if (selectedApp?._id === appId) {
        const updated = applications.find(a => a._id === appId);
        setSelectedApp({ ...updated, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateAssessment = async (appId, data) => {
    try {
      await applicationAPI.updateNotes(appId, data);
      toast.success('Candidate assessment saved');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to save assessment');
    }
  };

  const handleScheduleInterview = async (appId, data) => {
    try {
      await applicationAPI.scheduleInterview(appId, data);
      toast.success('Interview protocol initiated');
      fetchApplications();
      setIsScheduleModalOpen(false);
    } catch (error) {
      toast.error('Protocol initialization failed');
    }
  };

  const handleUpdateInterviewFeedback = async (appId, interviewId, data) => {
    try {
      await applicationAPI.updateInterviewFeedback(appId, interviewId, data);
      toast.success('Candidate assessment logged successfully');
      fetchApplications();
      setEvaluatingInterview(null);
    } catch (error) {
      toast.error('Assessment logging failed');
    }
  };

  const handleGenerateAIVerdict = async (appId) => {
    const toastId = toast.loading('Synthesizing candidate profile and interview vectors...');
    try {
      const res = await applicationAPI.generateAIVerdict(appId);
      toast.success('Executive AI Verdict generated', { id: toastId });
      fetchApplications();
    } catch (error) {
      toast.error('Synthesis failed', { id: toastId });
    }
  };

  const handleGenerateQuestions = async (appId) => {
    setIsGenerating(true);
    const toastId = toast.loading('Synthesizing interview questions...');
    try {
      const res = await applicationAPI.generateQuestions(appId);
      setActiveQuestions({ appId, questions: res.data.questions });
      toast.success('Interview vectors generated', { id: toastId });
    } catch (error) {
      toast.error('Synthesis failed', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Scanning Talent Database...</p>
       </div>
    </div>
  );

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
                 <HiOutlineUserGroup /> Personnel Management
               </div>
               <h1 className="text-5xl font-black text-white font-outfit tracking-tighter mb-2">Talent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Pipeline</span></h1>
               <p className="text-slate-400 font-medium max-w-md leading-relaxed">
                 {jobId ? `Analyzing applicants for ${applications[0]?.job?.title || 'Job'}` : 'Review all applicants across your active operational sectors.'}
               </p>
             </div>
             
             <div className="relative z-10 flex flex-wrap items-center gap-2 bg-slate-950/50 p-2 rounded-2xl border border-white/5">
               {['', 'APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'].map((status) => (
                 <button
                   key={status}
                   onClick={() => setFilterStatus(status)}
                   className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                 >
                   {status || 'All Units'}
                 </button>
               ))}
             </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {applications.length > 0 ? applications.map((app, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={app._id} 
                  onClick={() => { setSelectedApp(app); setIsModalOpen(true); }}
                  className="group bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 hover:border-primary/50 transition-all shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-10 cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col items-center justify-center lg:w-56 bg-slate-950/50 border border-white/5 rounded-[32px] p-8 relative z-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-24 h-24 bg-slate-900 rounded-[32px] border border-white/10 overflow-hidden flex items-center justify-center text-3xl font-black text-slate-700 relative z-10">
                        {app.candidate?.avatar ? <img src={app.candidate.avatar} alt="" className="w-full h-full object-cover" /> : app.candidate?.name?.[0] || '?'}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-white font-outfit text-center leading-tight mb-3">{app.candidate?.name || 'Unknown'}</h3>
                    <div className="flex flex-col items-center text-[10px] font-black uppercase tracking-widest text-slate-500 gap-2 w-full">
                      <span className="flex items-center gap-2 w-full justify-center truncate"><HiOutlineLocationMarker className="text-primary" /> {app.candidate?.location || 'Remote'}</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Operational Objective</p>
                        <h2 className="text-2xl font-black text-white group-hover:text-primary transition-colors font-outfit tracking-tight">{app.job?.title || 'Deleted Mission'}</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          app.status === 'HIRED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Skill Matrix</p>
                      <div className="flex flex-wrap gap-2">
                        {app.candidate?.skills?.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-4 py-1.5 bg-slate-950 border border-white/5 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                            {skill}
                          </span>
                        ))}
                        {app.candidate?.skills?.length > 4 && (
                          <span className="px-4 py-1.5 bg-slate-950 border border-white/5 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            +{app.candidate.skills.length - 4} More
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6 mt-auto pt-8 border-t border-white/5">
                      <div className="flex items-center gap-6">
                        {app.aiMatchScore && (
                          <span className="text-[10px] font-black bg-blue-500/10 text-primary px-4 py-2 rounded-xl border border-blue-500/20 flex items-center gap-2">
                            <HiOutlineSparkles className="animate-pulse" /> {app.aiMatchScore}% Match
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div key={star} className={`w-1.5 h-1.5 rounded-full ${app.rating >= star ? 'bg-primary' : 'bg-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
                        View Pipeline Status <HiOutlineChevronRight />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 bg-slate-900/20 rounded-[40px] border border-dashed border-white/5 shadow-2xl"
                >
                  <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 text-slate-700">
                    <HiOutlineUserGroup size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white font-outfit mb-4">No Candidates Tracked</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">The pipeline is currently clear. Active recruitment will populate this field with qualified units.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pipeline Management Modal */}
          <AnimatePresence>
            {isModalOpen && selectedApp && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-950/90 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-slate-900 border border-white/10 max-w-6xl w-full max-h-[90vh] rounded-[48px] shadow-[0_0_150px_rgba(0,136,255,0.15)] relative overflow-hidden flex flex-col md:flex-row"
                >
                  {/* Modal Sidebar - Profile */}
                  <div className="md:w-80 bg-slate-950 p-10 flex flex-col border-r border-white/5 overflow-y-auto">
                    <div className="flex items-center justify-center mb-8 relative">
                      <div className="w-32 h-32 bg-slate-900 rounded-[40px] border border-white/10 overflow-hidden flex items-center justify-center text-4xl font-black text-slate-700 relative z-10 shadow-2xl">
                         {selectedApp.candidate?.avatar ? <img src={selectedApp.candidate.avatar} alt="" className="w-full h-full object-cover" /> : selectedApp.candidate?.name?.[0]}
                      </div>
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-white font-outfit text-center mb-2 tracking-tight">{selectedApp.candidate?.name}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-8">{selectedApp.candidate?.role || 'Operational Specialist'}</p>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Intelligence Score</p>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                           <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedApp.aiMatchScore}%` }}
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-500" 
                           />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] font-black text-primary">{selectedApp.aiMatchScore}% Match</span>
                          <span className="text-[10px] font-black text-slate-600">Neural Sync</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-3">
                          <HiOutlineClipboardList /> Review Dossier
                        </button>
                        <a href={selectedApp.candidate?.resumeUrl} target="_blank" rel="noreferrer" className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-3">
                          <HiOutlineExternalLink /> Export Resume
                        </a>
                      </div>
                    </div>

                    <div className="mt-auto pt-10">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="w-full py-4 bg-slate-900 border border-white/10 hover:border-white/20 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                      >
                        Terminate View
                      </button>
                    </div>
                  </div>

                  {/* Modal Content - Pipeline */}
                  <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-10">
                       <div>
                         <h4 className="text-3xl font-black text-white font-outfit tracking-tight leading-none mb-2">Pipeline Tracking</h4>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Mission: {selectedApp?.job?.title}</p>
                       </div>
                       <div className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner">
                         {['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'TECHNICAL', 'OFFER', 'HIRED'].map((st) => (
                           <div 
                            key={st}
                            className={`w-3 h-3 rounded-full ${selectedApp.status === st ? 'bg-primary ring-4 ring-primary/20' : 'bg-slate-800'}`}
                            title={st}
                           />
                         ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Left Side - Actions & Assessment */}
                      <div className="space-y-8">
                        <section className="bg-slate-950/50 p-8 rounded-[32px] border border-white/5">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <HiOutlineLightningBolt className="text-primary" /> Command Actions
                           </h5>
                           <div className="grid grid-cols-2 gap-4">
                             {['SCREENING', 'SHORTLISTED', 'TECHNICAL', 'OFFER', 'HIRED', 'REJECTED'].map((st) => (
                               <button
                                 key={st}
                                 onClick={() => handleUpdateStatus(selectedApp._id, st)}
                                 className={`py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                   selectedApp.status === st 
                                   ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                   : 'bg-slate-900 text-slate-500 border-white/5 hover:border-primary/50 hover:text-white'
                                 }`}
                               >
                                 {st}
                               </button>
                             ))}
                           </div>
                        </section>

                        <section className="bg-slate-950/50 p-8 rounded-[32px] border border-white/5">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <HiOutlineClipboardList className="text-primary" /> Recruiter Assessment
                           </h5>
                           <textarea 
                             className="w-full h-32 bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-primary/50 transition-all mb-4 placeholder:text-slate-700"
                             placeholder="Enter operational notes here..."
                             defaultValue={selectedApp.recruiterNotes}
                             onBlur={(e) => handleUpdateAssessment(selectedApp._id, { recruiterNotes: e.target.value })}
                           />
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               {[1,2,3,4,5].map(s => (
                                 <button 
                                   key={s} 
                                   onClick={() => handleUpdateAssessment(selectedApp._id, { rating: s })}
                                   className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${selectedApp.rating >= s ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-900 border-white/5 text-slate-600'}`}
                                 >
                                   {s}
                                 </button>
                               ))}
                             </div>
                             <button className="px-6 py-2 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white">Save Notes</button>
                           </div>
                        </section>

                        {selectedApp.interviews?.some(i => i.status === 'COMPLETED') && (
                           <section className="bg-slate-950/50 p-8 rounded-[32px] border border-white/5 relative overflow-hidden group/ai mt-8">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                              <div className="flex justify-between items-center mb-6">
                                <h5 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                  <HiOutlineSparkles className="animate-pulse" /> AI Executive Synthesis
                                </h5>
                                <button 
                                  onClick={() => handleGenerateAIVerdict(selectedApp._id)}
                                  className="text-[9px] font-black text-slate-500 hover:text-primary transition-colors"
                                >
                                  {selectedApp.aiVerdict ? 'Re-generate' : 'Generate Verdict'}
                                </button>
                              </div>

                              {selectedApp.aiVerdict ? (
                                <div className="space-y-6">
                                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                    <p className="text-xs text-slate-300 leading-relaxed italic">"{selectedApp.aiVerdict.summary}"</p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Recommendation</span>
                                      <span className={`text-xl font-black font-outfit ${
                                        selectedApp.aiVerdict.verdict === 'HIRE' ? 'text-emerald-500' :
                                        selectedApp.aiVerdict.verdict === 'CONSIDER' ? 'text-amber-500' : 'text-rose-500'
                                      }`}>
                                        {selectedApp.aiVerdict.verdict}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Confidence Score</span>
                                      <p className="text-xl font-black text-white font-outfit">{selectedApp.aiVerdict.confidence}%</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                     <div>
                                       <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">Key Strengths</span>
                                       <div className="flex flex-wrap gap-1">
                                         {selectedApp.aiVerdict.keyStrengths?.map((s, i) => (
                                           <span key={i} className="px-2 py-1 bg-emerald-500/5 text-emerald-500 text-[7px] font-black uppercase rounded-lg border border-emerald-500/10">{s}</span>
                                         ))}
                                       </div>
                                     </div>
                                     <div>
                                       <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-2 block">Potential Risks</span>
                                       <div className="flex flex-wrap gap-1">
                                         {selectedApp.aiVerdict.potentialRisks?.map((r, i) => (
                                           <span key={i} className="px-2 py-1 bg-rose-500/5 text-rose-500 text-[7px] font-black uppercase rounded-lg border border-rose-500/10">{r}</span>
                                         ))}
                                       </div>
                                     </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
                                  <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Pending interview vectors</p>
                                  <button 
                                    onClick={() => handleGenerateAIVerdict(selectedApp._id)}
                                    className="mt-4 px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase hover:bg-primary hover:text-white transition-all"
                                  >
                                    Initialize Synthesis
                                  </button>
                               </div>
                             )}
                          </section>
                        )}
                      </div>

                      {/* Right Side - Timeline & Interviews */}
                      <div className="space-y-8">
                         <section className="bg-slate-950/50 p-8 rounded-[32px] border border-white/5">
                           <div className="flex justify-between items-center mb-6">
                             <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <HiOutlineChatAlt className="text-primary" /> Interview Schedule
                             </h5>
                             <button 
                              onClick={() => setIsScheduleModalOpen(true)}
                              className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest"
                             >
                               + New Round
                             </button>
                           </div>
                           
                           <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                             {selectedApp.interviews?.length > 0 ? selectedApp.interviews.map((int, i) => (
                               <div key={i} className="p-4 bg-slate-900 rounded-2xl border border-white/5 flex justify-between items-center group">
                                 <div>
                                   <p className="text-[10px] font-black text-white uppercase tracking-tight">{int.type} Protocol</p>
                                   <p className="text-[9px] text-slate-500 font-medium">{new Date(int.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">{int.status}</span>
                                   
                                   {int.status === 'SCHEDULED' && (
                                     <button 
                                      onClick={(e) => { e.preventDefault(); setEvaluatingInterview(int); }}
                                      className="p-2 text-amber-500 hover:text-amber-400 transition-colors"
                                      title="Complete & Evaluate"
                                     >
                                       <HiOutlineCheck size={14} />
                                     </button>
                                   )}

                                   {int.meetingLink && (int.meetingLink.startsWith('http') && !int.meetingLink.includes(window.location.host)) ? (
                                     <a href={int.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 text-blue-500 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20">
                                       <HiOutlineLightningBolt size={12} /> Join External
                                     </a>
                                   ) : (
                                     <Link to={`/interview/${selectedApp?._id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20">
                                       <HiOutlineLightningBolt size={12} /> Start Session
                                     </Link>
                                   )}
                                 </div>
                               </div>
                             )) : (
                               <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
                                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No rounds scheduled</p>
                               </div>
                             )}
                           </div>
                         </section>

                         <section className="bg-slate-950/50 p-8 rounded-[32px] border border-white/5">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <HiOutlineClipboardList className="text-primary" /> Deployment Timeline
                           </h5>
                           <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                             {selectedApp.timeline?.slice().reverse().map((tm, i) => (
                               <div key={i} className="relative pl-8 group/tm">
                                 <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-slate-950 transition-colors ${i === 0 ? 'bg-primary ring-4 ring-primary/10' : 'bg-slate-700'}`} />
                                 <p className={`text-[10px] font-black uppercase tracking-tight ${i === 0 ? 'text-white' : 'text-slate-500'}`}>{tm.status}</p>
                                 <p className="text-[9px] text-slate-600 font-medium leading-relaxed">{tm.note}</p>
                                 <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-1">{new Date(tm.changedAt).toLocaleDateString()}</p>
                               </div>
                             ))}
                           </div>
                         </section>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* AI Questions Modal */}
          <AnimatePresence>
            {activeQuestions && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-md"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-slate-900 border border-white/10 max-w-2xl w-full p-10 rounded-[40px] shadow-[0_0_100px_rgba(0,136,255,0.1)] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                  
                  <button 
                    onClick={() => setActiveQuestions(null)}
                    className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                  >
                    <HiOutlineX size={24} />
                  </button>
                  
                  <div className="flex items-center gap-6 mb-10 border-b border-white/5 pb-8">
                    <div className="p-4 bg-primary/10 text-primary rounded-[20px] border border-primary/20">
                      <HiOutlineChatAlt size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white font-outfit tracking-tight">Interview Vectors</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Neural generation based on skill matrix</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                    {activeQuestions.questions.map((q, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-6 rounded-3xl bg-slate-950/50 border border-white/5 text-slate-300 text-sm font-medium flex gap-4 group hover:border-primary/30 transition-all shadow-inner"
                      >
                        <span className="text-primary font-black font-outfit text-lg">{i+1}.</span> 
                        <p className="leading-relaxed">{q}</p>
                      </motion.div>
                    ))}
                  </div>

                  <button onClick={() => setActiveQuestions(null)} className="w-full py-4 bg-slate-950 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-2xl">
                    Terminate Session
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Schedule Interview Modal */}
          <ScheduleInterviewModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            onSchedule={(data) => handleScheduleInterview(selectedApp._id, data)}
            candidateName={selectedApp?.candidate?.name}
            jobTitle={selectedApp?.job?.title}
          />

          <InterviewEvaluationModal
            isOpen={!!evaluatingInterview}
            onClose={() => setEvaluatingInterview(null)}
            onSave={(data) => handleUpdateInterviewFeedback(selectedApp._id, evaluatingInterview._id, data)}
            candidateName={selectedApp?.candidate?.name}
            interviewType={evaluatingInterview?.type}
          />
        </div>
      </main>
    </div>
  );
};

export default RecruiterApplications;
