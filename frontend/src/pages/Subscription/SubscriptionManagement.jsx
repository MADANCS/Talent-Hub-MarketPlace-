import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscriptionAPI } from '../../services/api';
import { 
  HiOutlineCheckCircle, HiOutlineShieldCheck, 
  HiOutlineDocumentText, HiOutlineRefresh, HiOutlineLightningBolt, HiOutlineViewGrid,
  HiOutlineBriefcase, HiOutlineUserGroup, HiOutlinePlus, HiOutlineChat,
  HiOutlineIdentification, HiOutlineSearch, HiOutlineCollection,
  HiOutlineCreditCard
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const fetchSub = async () => {
      try {
        const res = await subscriptionAPI.getCurrentSubscription();
        setSubscription(res.data.subscription);
      } catch (error) {
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Accessing Billing Nexus...</p>
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

        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden"
          >
             <div className="relative z-10">
               <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-4">
                 <HiOutlineCreditCard /> Financial Operations
               </div>
               <h1 className="text-5xl font-black text-white font-outfit tracking-tighter mb-2">Subscription & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Billing</span></h1>
               <p className="text-slate-400 font-medium max-w-md leading-relaxed">Oversee your operational tier and financial synchronization parameters.</p>
             </div>
          </motion.div>

          {!subscription ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/40 backdrop-blur-xl p-20 rounded-[40px] border border-white/5 shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-slate-950 flex items-center justify-center text-slate-600 border border-white/5 mx-auto mb-8 shadow-inner">
                <HiOutlineLightningBolt size={32} />
              </div>
              <h2 className="text-2xl font-black text-white font-outfit mb-4">No Active Protocol</h2>
              <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                You are currently on the baseline tier. Upgrade to unlock neural matching capabilities and high-priority mission access.
              </p>
              <Link to="/pricing" className="px-10 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-primary/20 active:scale-95">
                Initialize Upgrade
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Active Plan Context */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-white transition-opacity group-hover:opacity-[0.05]">
                  <HiOutlineShieldCheck size={200} />
                </div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">{subscription.plan.name}</h3>
                        <span className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">ACTIVE PROTOCOL</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural features fully operational</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Next Synchronization</p>
                      <p className="text-2xl font-black text-white font-outfit tracking-tight">{new Date(subscription.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-8 rounded-[32px] bg-slate-950 border border-white/5 shadow-inner group/stat hover:border-primary/30 transition-all">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Mission Threshold</p>
                      <p className="text-2xl font-black text-white font-outfit">{subscription.plan.features.jobPostings === -1 ? 'Unlimited' : subscription.plan.features.jobPostings}</p>
                    </div>
                    <div className="p-8 rounded-[32px] bg-slate-950 border border-white/5 shadow-inner group/stat hover:border-primary/30 transition-all">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Neural Processing</p>
                      <p className={`text-2xl font-black font-outfit ${subscription.plan.features.aiMatching ? 'text-primary' : 'text-slate-700'}`}>
                        {subscription.plan.features.aiMatching ? 'Optimized' : 'Baseline'}
                      </p>
                    </div>
                    <div className="p-8 rounded-[32px] bg-slate-950 border border-white/5 shadow-inner group/stat hover:border-primary/30 transition-all">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Billing Cadence</p>
                      <p className="text-2xl font-black text-white font-outfit capitalize">{subscription.plan.billingCycle}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-8 py-3 bg-slate-950 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:border-white/20 hover:text-white transition-all active:scale-95">
                      Protocol Config
                    </button>
                    <Link to="/pricing" className="px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-primary/20 text-center active:scale-95">
                      Change Protocol
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Transaction Telemetry */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-1.5 h-8 bg-primary rounded-full" />
                   <h3 className="text-2xl font-black text-white font-outfit tracking-tight">Financial Telemetry</h3>
                </div>
                
                <div className="space-y-4">
                  {[1].map((_, i) => (
                    <div key={i} className="flex flex-col md:flex-row justify-between items-center p-8 rounded-[32px] bg-slate-950 border border-white/5 shadow-inner hover:border-primary/20 transition-all group/item">
                      <div className="flex items-center gap-6 mb-6 md:mb-0">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
                          <HiOutlineCheckCircle size={28} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white font-outfit tracking-tight">{subscription.plan.name} Tier Deployment</h4>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1 font-mono">HASH: 0x{Math.floor(Math.random() * 1000000).toString(16).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-2xl font-black text-white font-outfit tracking-tighter">${subscription.plan.price}</p>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{new Date(subscription.startDate).toLocaleDateString()}</p>
                        </div>
                        <button className="p-3 text-slate-600 hover:text-primary transition-all rounded-xl hover:bg-slate-900 active:scale-95">
                          <HiOutlineRefresh size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscriptionManagement;
