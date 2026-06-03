import { useState, useEffect } from 'react';
import { subscriptionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  HiOutlineCheck, HiOutlineSparkles, HiOutlineLightningBolt, 
  HiOutlineGlobeAlt, HiOutlineShieldCheck, HiOutlineTrendingUp,
  HiOutlineChevronRight, HiOutlineCurrencyDollar, HiOutlineCubeTransparent,
  HiOutlineStar
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Pricing = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await subscriptionAPI.getPlans();
        setPlans(res.data.plans);
      } catch (error) {
        toast.error('Failed to load pricing plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (planId) => {
    if (!user) {
      toast.error('Authentication required for deployment.');
      return;
    }
    
    setIsProcessing(true);
    const toastId = toast.loading('Processing subscription...');
    
    try {
      const res = await subscriptionAPI.createOrder({ planId });
      const { order, key, demo } = res.data;

      if (demo) {
        await subscriptionAPI.verifyPayment({ 
          razorpay_order_id: order.id, 
          planId, 
          demo: true 
        });
        toast.success('Subscription activated successfully.', { id: toastId });
        window.location.reload();
      } else {
        const options = {
          key,
          amount: order.amount,
          currency: order.currency,
          name: 'JobSleuths Enterprise',
          description: `Subscription Upgrade`,
          order_id: order.id,
          handler: async (response) => {
            await subscriptionAPI.verifyPayment({ ...response, planId });
            toast.success('Subscription active. Welcome aboard.', { id: toastId });
            window.location.reload();
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: '#0088ff' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Accessing Financial Grid...</p>
       </div>
    </div>
  );

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-primary/20 selection:text-primary">
      <div className="container mx-auto px-6 py-32 max-w-7xl relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="text-center mb-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-10 shadow-2xl shadow-primary/10"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#0088ff]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Financial Protocols</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-9xl font-black text-white mb-10 font-outfit tracking-tighter leading-none">
            Scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Hiring</span> DNA
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
            Acquire elite talent at synchronization velocity with our <span className="text-white font-black italic">Neural Enterprise Hub</span>.
          </p>

          {/* Billing Selection */}
          <div className="flex items-center justify-center gap-2 mb-20 bg-slate-900/50 backdrop-blur-xl p-2 rounded-[32px] border border-white/5 w-fit mx-auto shadow-2xl">
            <button 
              onClick={() => setBillingPeriod('monthly')}
              className={`px-12 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${billingPeriod === 'monthly' ? 'bg-primary text-white shadow-2xl shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Standard Cadence
            </button>
            <button 
              onClick={() => setBillingPeriod('yearly')}
              className={`px-12 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${billingPeriod === 'yearly' ? 'bg-primary text-white shadow-2xl shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Annual Protocol
              <span className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-[8px] font-black shadow-2xl uppercase tracking-widest border border-white/10">SAVE 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto mb-48 relative z-10">
          {plans.map((plan, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={plan.id} 
              className={`p-12 flex flex-col h-full rounded-[48px] border backdrop-blur-xl transition-all duration-500 group relative ${plan.popular ? 'border-primary bg-slate-900/60 shadow-[0_40px_100px_rgba(0,136,255,0.15)] scale-105 z-10' : 'border-white/5 bg-slate-900/40 shadow-2xl hover:border-white/10'}`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-primary rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center gap-2 border border-white/10">
                  <HiOutlineStar size={14} className="animate-pulse" /> Highly Recommended
                </div>
              )}
              
              <div className="mb-12">
                <h3 className="text-4xl font-black text-white mb-3 font-outfit tracking-tighter">{plan.name} Tier</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{plan.description}</p>
              </div>

              <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black text-white font-outfit tracking-tighter leading-none">₹{billingPeriod === 'yearly' ? Math.floor(plan.price * 0.8) : plan.price}</span>
                  <span className="text-slate-600 text-sm font-black uppercase tracking-widest">/ {plan.billingCycle}</span>
                </div>
                {billingPeriod === 'yearly' && plan.price > 0 && <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-6 flex items-center gap-2"><HiOutlineShieldCheck /> Annual Billing Active</p>}
              </div>

              <div className="space-y-7 mb-16 flex-1">
                <div className="flex items-center gap-5 text-[10px] font-black text-slate-400 uppercase tracking-widest group/item">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/5 transition-transform group-hover/item:scale-110">
                    <HiOutlineCheck className="text-primary" size={20} />
                  </div>
                  <span>{plan.features.jobPostings === -1 ? 'Unlimited' : plan.features.jobPostings} Mission Slots</span>
                </div>
                {[
                  { key: 'aiMatching', label: 'Neural Candidate Analysis', icon: HiOutlineSparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { key: 'advancedAnalytics', label: 'Predictive Telemetry', icon: HiOutlineTrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { key: 'apiAccess', label: 'External Grid Access', icon: HiOutlineGlobeAlt, color: 'text-primary', bg: 'bg-primary/10' }
                ].map((feat) => (
                  <div key={feat.key} className={`flex items-center gap-5 text-[10px] font-black uppercase tracking-widest transition-all group/item ${plan.features[feat.key] ? 'text-slate-400' : 'text-slate-700 line-through opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform ${plan.features[feat.key] ? feat.bg + ' border-white/5 group-hover/item:scale-110' : 'bg-slate-950 border-white/5'}`}>
                      <feat.icon className={plan.features[feat.key] ? feat.color : 'text-slate-800'} size={20} />
                    </div>
                    <span>{feat.label}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSubscribe(plan.id)}
                disabled={isProcessing || (user?.subscription?.plan === plan.id.split('_')[0] && user?.subscription?.status === 'ACTIVE')}
                className={`w-full py-6 rounded-[32px] text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-500 transform active:scale-95 shadow-2xl ${
                  plan.popular 
                    ? 'bg-primary text-white shadow-primary/20 hover:bg-blue-500' 
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-900 border border-white/10 hover:border-white/20'
                }`}
              >
                {user?.subscription?.plan === plan.id.split('_')[0] && user?.subscription?.status === 'ACTIVE' 
                  ? 'Current Protocol' 
                  : isProcessing ? 'Processing...' : 'Deploy ' + plan.name}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Global Support / FAQ */}
        <div className="max-w-5xl mx-auto pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            {[
              { q: "Can I adjust my protocol later?", a: "Yes, you can upgrade or adjust your operational tier at any time. Protocols synchronize instantly." },
              { q: "How accurate is Neural Matching?", a: "Our AI engine delivers 99.9% semantic match scoring, significantly outperforming legacy keyword filters." },
              { q: "Are financial transfers secure?", a: "Every byte is encrypted via Razorpay's 256-bit AES tunnel for absolute financial integrity." },
              { q: "Do you offer a sandbox environment?", a: "We provide a baseline tier to test the grid. Neural features and high-priority deployments require tier upgrades." }
            ].map((faq, i) => (
              <div key={i} className="space-y-6 bg-slate-900/20 backdrop-blur-sm p-10 rounded-[40px] border border-white/5 hover:border-white/10 transition-all">
                <h4 className="text-white font-black text-2xl font-outfit tracking-tighter uppercase flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                  {faq.q}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium pl-6 border-l border-white/10">{faq.a}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
                <HiOutlineShieldCheck size={36} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2">Integrity Protocol</p>
                <p className="text-xl font-black text-white font-outfit">14-Day Full Reversal Policy</p>
              </div>
            </div>
            <div className="flex items-center gap-12 opacity-20 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
              <HiOutlineCurrencyDollar size={48} className="text-white" />
              <span className="text-4xl font-black text-white font-outfit tracking-tighter italic opacity-50">SECURE TERMINAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
;
