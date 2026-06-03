import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineBookmark, HiBookmark } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BookmarkButton — reusable save/unsave toggle for any job card or details page.
 *
 * Props:
 *   jobId    {string}  — the job's _id
 *   size     {number}  — icon size (default 18)
 *   variant  {string}  — 'icon' (default) | 'button'
 */
const BookmarkButton = ({ jobId, size = 18, variant = 'icon', className = '' }) => {
  const { user }            = useAuth();
  const [saved, setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [burst, setBurst]   = useState(false);

  // Initialise from user's savedJobs if available
  useEffect(() => {
    if (user?.savedJobs) {
      setSaved(user.savedJobs.some(j => (j._id || j) === jobId));
    }
  }, [user, jobId]);

  if (!user || user.role !== 'CANDIDATE') return null;

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      if (saved) {
        await userAPI.unsaveJob(jobId);
        setSaved(false);
        toast('Removed from saved jobs', { icon: '🗑️' });
      } else {
        await userAPI.saveJob(jobId);
        setSaved(true);
        setBurst(true);
        setTimeout(() => setBurst(false), 600);
        toast.success('Job saved!', { icon: '🔖' });
      }
    } catch {
      toast.error('Could not update saved jobs');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'button') {
    return (
      <button
        id={`bookmark-btn-${jobId}`}
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${
          saved
            ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
            : 'bg-slate-800 border-white/5 text-slate-400 hover:border-indigo-500/30 hover:text-indigo-400'
        } ${className}`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : saved ? (
          <HiBookmark size={size} className="fill-current" />
        ) : (
          <HiOutlineBookmark size={size} />
        )}
        {saved ? 'Saved' : 'Save Job'}
      </button>
    );
  }

  // Default: icon only
  return (
    <motion.button
      id={`bookmark-icon-${jobId}`}
      onClick={handleToggle}
      disabled={loading}
      whileTap={{ scale: 0.85 }}
      className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
        saved
          ? 'bg-indigo-600/20 text-indigo-400 hover:bg-red-500/10 hover:text-red-400'
          : 'bg-slate-800/50 text-slate-500 hover:bg-slate-700 hover:text-white'
      } ${className}`}
      title={saved ? 'Remove from saved' : 'Save job'}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : saved ? (
        <HiBookmark size={size} className="fill-current" />
      ) : (
        <HiOutlineBookmark size={size} />
      )}

      {/* Burst animation on save */}
      <AnimatePresence>
        {burst && (
          <motion.span
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-xl bg-indigo-500/30 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default BookmarkButton;
