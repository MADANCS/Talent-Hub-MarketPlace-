import { motion } from 'framer-motion';
import { HiOutlineLightningBolt } from 'react-icons/hi';

const LoadingSpinner = ({ fullPage = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-12">
      <div className="relative w-24 h-24">
        {/* Orbital Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[3px] border-[#0088ff]/10 border-t-primary rounded-[32px] shadow-[0_0_20px_rgba(0,136,255,0.2)]"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-[2px] border-indigo-500/10 border-b-indigo-500 rounded-[24px]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <HiOutlineLightningBolt className="text-primary text-3xl" />
          </motion.div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse mt-4">Loading...</p>
        <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1/2 h-full bg-primary"
          />
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-[1000]">
        {spinner}
      </div>
    );
  }

  return <div className="p-20 flex justify-center">{spinner}</div>;
};

export default LoadingSpinner;
