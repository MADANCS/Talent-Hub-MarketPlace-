import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineX, HiOutlineVideoCamera, HiOutlineCalendar, 
  HiOutlineClock, HiOutlineLink, HiOutlineInformationCircle 
} from 'react-icons/hi';
import { SiZoom, SiGooglemeet } from 'react-icons/si';

const ScheduleInterviewModal = ({ isOpen, onClose, onSchedule, candidateName, jobTitle }) => {
  const [type, setType] = useState('VIDEO'); // VIDEO (Agora), ZOOM, GOOGLE_MEET
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const scheduledAt = new Date(`${date}T${time}`);
    
    await onSchedule({
      type,
      scheduledAt,
      duration,
      notes
    });
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-white font-outfit tracking-tight">Schedule Interview</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Candidate: {candidateName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <HiOutlineX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Meeting Provider */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineVideoCamera /> Meeting Provider
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('VIDEO')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  type === 'VIDEO' ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <HiOutlineVideoCamera size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tight">JobSleuths</span>
              </button>

              <button
                type="button"
                onClick={() => setType('ZOOM')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  type === 'ZOOM' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <SiZoom size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tight">Zoom</span>
              </button>

              <button
                type="button"
                onClick={() => setType('GOOGLE_MEET')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  type === 'GOOGLE_MEET' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <SiGooglemeet size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tight">GMeet</span>
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineCalendar /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineClock /> Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineClock /> Duration (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none appearance-none"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HiOutlineInformationCircle /> Instructions for Candidate
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. Please be prepared to discuss your previous projects..."
              className="w-full h-24 bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineCalendar /> Confirm Schedule
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ScheduleInterviewModal;
