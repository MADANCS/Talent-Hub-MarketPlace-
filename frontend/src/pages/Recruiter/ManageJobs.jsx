import { useState, useEffect } from 'react';
import { jobAPI } from '../../services/api';
import { 
  HiOutlineBriefcase, HiOutlineUsers, HiOutlineChartBar, 
  HiOutlinePlus, HiOutlineChat, HiOutlineLocationMarker,
  HiOutlineTrash, HiOutlinePencilAlt, HiOutlineLightningBolt,
  HiOutlineChevronRight
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState(null);
  const navigate = useNavigate();

  const dashboardLinks = [
    { label: 'Overview', path: '/recruiter/dashboard', icon: HiOutlineChartBar },
    { label: 'Jobs', path: '/recruiter/jobs', icon: HiOutlineBriefcase },
    { label: 'Candidates', path: '/recruiter/applications', icon: HiOutlineUsers },
    { label: 'Post a Job', path: '/recruiter/post-job', icon: HiOutlinePlus },
    { label: 'Messages', path: '/messages', icon: HiOutlineChat },
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getMyJobs();
      setJobs(res.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    setJobToDelete(null); // Close modal
    try {
      await jobAPI.deleteJob(id);
      toast.success('Mission terminated successfully');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to terminate mission');
      console.error('Delete Job Error:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Accessing Active Missions...</p>
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
                 <HiOutlineBriefcase /> Mission Control
               </div>
               <h1 className="text-5xl font-black text-white font-outfit tracking-tighter mb-2">Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Jobs</span></h1>
               <p className="text-slate-400 font-medium max-w-md leading-relaxed">Review and coordinate your active operational requirements and applicant flow.</p>
             </div>
             
             <Link to="/recruiter/post-job" className="px-10 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-3 relative z-10">
               <HiOutlinePlus /> Deploy New Mission
             </Link>
          </motion.div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {jobs.length > 0 ? jobs.map((job, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={job._id} 
                  className="group bg-slate-900/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 hover:border-primary/50 transition-all shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <Link to={`/jobs/${job._id}`} className="text-2xl font-black text-white group-hover:text-primary transition-colors font-outfit tracking-tight">
                          {job.title}
                        </Link>
                        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border ${job.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 text-slate-500 border-white/5'}`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-slate-500 mb-8 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><HiOutlineLocationMarker className="text-primary" /> {job.location}</span>
                        <span className="flex items-center gap-2"><HiOutlineBriefcase className="text-emerald-500" /> {job.jobType}</span>
                        <span className="flex items-center gap-2 text-slate-600"><HiOutlineLightningBolt /> {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <Link to={`/recruiter/applications?job=${job._id}`} className="px-6 py-3 bg-slate-950 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-3">
                          <HiOutlineUsers size={16} /> {job.applicationCount} Applicants
                        </Link>
                        
                        <div className="h-4 w-px bg-white/5" />
                        
                        <div className="flex items-center gap-4">
                          <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                            <HiOutlinePencilAlt /> Edit
                          </button>
                          <button onClick={() => setJobToDelete(job._id)} className="text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-rose-500 transition-colors flex items-center gap-2">
                            <HiOutlineTrash /> Terminate
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                       <Link to={`/jobs/${job._id}`} className="w-12 h-12 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:border-primary transition-all group-hover:bg-primary group-hover:border-primary">
                          <HiOutlineChevronRight size={24} />
                       </Link>
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
                    <HiOutlineBriefcase size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white font-outfit mb-4">No Active Missions</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium mb-10 leading-relaxed">Your mission control is currently silent. Deploy a new position to start the talent acquisition protocol.</p>
                  <Link to="/recruiter/post-job" className="px-10 py-4 bg-slate-950 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary hover:border-primary transition-all shadow-2xl">
                    Post Your First Job
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {jobToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HiOutlineTrash size={32} />
              </div>
              <h3 className="text-2xl font-black text-white font-outfit text-center mb-4">Terminate Mission?</h3>
              <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
                This action is irreversible. The mission and all its data will be permanently purged from the system.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setJobToDelete(null)}
                  className="flex-1 py-4 bg-slate-950 border border-white/5 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={() => handleDelete(jobToDelete)}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all"
                >
                  Confirm Purge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageJobs;
