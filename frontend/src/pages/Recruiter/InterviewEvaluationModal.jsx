import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineX, HiOutlineChartBar, HiOutlineChatAlt2, 
  HiOutlineCheckCircle, HiOutlineSparkles 
} from 'react-icons/hi';

const InterviewEvaluationModal = ({ isOpen, onClose, onSave, candidateName, interviewType }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState(0);
  const [cultureFit, setCultureFit] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await onSave({
      rating,
      feedback,
      technicalSkills,
      cultureFit,
      status: 'COMPLETED'
    });
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        
        <div className="p-10 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-white font-outfit tracking-tight">Interview Evaluation</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
              Assessment for {candidateName} • {interviewType} Protocol
            </p>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-950 hover:bg-slate-800 rounded-3xl border border-white/5 transition-all text-slate-500 hover:text-white">
            <HiOutlineX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Overall Rating */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineChartBar className="text-amber-500" /> Overall Candidate Rating
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-14 h-14 rounded-2xl border transition-all flex items-center justify-center text-xl font-black ${
                    rating >= star ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-950 border-white/5 text-slate-700 hover:border-white/20'
                  }`}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Technical Score */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineSparkles className="text-blue-500" /> Technical Proficiency
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTechnicalSkills(s)}
                    className={`flex-1 py-2 rounded-xl border transition-all text-[10px] font-black ${
                      technicalSkills >= s ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-white/5 text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Culture Fit */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineCheckCircle className="text-emerald-500" /> Organizational Sync
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCultureFit(s)}
                    className={`flex-1 py-2 rounded-xl border transition-all text-[10px] font-black ${
                      cultureFit >= s ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-white/5 text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineChatAlt2 className="text-primary" /> Detailed Performance Review
            </label>
            <textarea
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide a comprehensive analysis of the candidate's performance during the session..."
              className="w-full h-32 bg-slate-950 border border-white/5 rounded-[32px] p-6 text-sm text-slate-300 focus:border-primary/50 outline-none resize-none placeholder:text-slate-700"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-2xl shadow-orange-900/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineCheckCircle size={18} /> Finalize Assessment & Log to Dossier
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default InterviewEvaluationModal;
