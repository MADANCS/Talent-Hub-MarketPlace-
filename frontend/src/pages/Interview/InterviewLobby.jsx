import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { interviewAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineVideoCamera, HiOutlineMicrophone,
  HiOutlineWifi, HiOutlineCheck, HiOutlineX,
  HiOutlineLightningBolt, HiOutlineCode,
  HiOutlineUser, HiOutlineClock
} from 'react-icons/hi';

const InterviewLobby = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [checks, setChecks] = useState({
    camera: null, // null = pending, true = pass, false = fail
    mic: null,
    network: null,
    browser: null,
  });
  const [allPassed, setAllPassed] = useState(false);
  const [stream, setStream] = useState(null);
  const [session, setSession] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const streamRef = useRef(null);

  // Run pre-flight checks
  useEffect(() => {
    runChecks();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    const passed = Object.values(checks).every(v => v === true);
    setAllPassed(passed);
  }, [checks]);

  const runChecks = async () => {
    // Browser check
    setChecks(p => ({ ...p, browser: true }));

    // Camera
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setChecks(p => ({ ...p, camera: true, mic: true }));
    } catch (e) {
      if (e.name === 'NotAllowedError' || e.name === 'NotFoundError') {
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
          setStream(audioOnly);
          streamRef.current = audioOnly;
          setChecks(p => ({ ...p, camera: false, mic: true }));
        } catch {
          setChecks(p => ({ ...p, camera: false, mic: false }));
        }
      } else {
        setChecks(p => ({ ...p, camera: false, mic: false }));
      }
    }

    // Network
    try {
      const start = Date.now();
      await fetch(import.meta.env.VITE_API_URL || 'http://localhost:5000/api' + '/../health');
      const latency = Date.now() - start;
      setChecks(p => ({ ...p, network: latency < 2000 }));
    } catch {
      setChecks(p => ({ ...p, network: navigator.onLine }));
    }
  };

  const handleJoinSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    navigate(`/interview/${id}`);
  };

  const CHECK_ITEMS = [
    { key: 'camera', label: 'Camera Access', icon: <HiOutlineVideoCamera size={18} />, failMsg: 'Camera not available — you can still join' },
    { key: 'mic', label: 'Microphone Access', icon: <HiOutlineMicrophone size={18} />, failMsg: 'Microphone required for interview' },
    { key: 'network', label: 'Network Connection', icon: <HiOutlineWifi size={18} />, failMsg: 'Slow or no connection detected' },
    { key: 'browser', label: 'Browser Compatible', icon: <HiOutlineLightningBolt size={18} />, failMsg: 'Browser may not support WebRTC' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pre-Interview Lobby</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Ready to Shine? 🚀</h1>
          <p className="text-sm text-slate-400">Let's verify everything is set before you enter the session</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-white/5" style={{ aspectRatio: '4/3' }}>
              {checks.camera ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              ) : checks.camera === false ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-3">
                    <HiOutlineUser size={32} className="text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500">Camera unavailable</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-[10px] font-bold text-white">{user?.name || 'You'}</span>
              </div>
            </div>

            {/* User card */}
            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-lg font-black text-indigo-400">{user?.name?.[0]}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">System Checks</p>

              {CHECK_ITEMS.map((item, i) => {
                const status = checks[item.key];
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      status === true ? 'bg-emerald-500/20 text-emerald-400' :
                      status === false ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {status === null ? (
                        <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
                      ) : status ? (
                        <HiOutlineCheck size={18} />
                      ) : (
                        <HiOutlineX size={18} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${status === true ? 'text-emerald-400' : status === false ? 'text-amber-400' : 'text-slate-400'}`}>
                        {item.label}
                      </p>
                      {status === false && (
                        <p className="text-[10px] text-amber-500/80">{item.failMsg}</p>
                      )}
                    </div>
                    {status === true && <span className="text-[9px] text-emerald-500 font-bold uppercase">Pass</span>}
                  </motion.div>
                );
              })}
            </div>

            {/* Tips */}
            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Tips</p>
              <ul className="space-y-2 text-[11px] text-slate-400">
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> Close unnecessary tabs for better performance</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> Use a quiet environment with good lighting</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> Have your resume and portfolio ready</li>
                <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">•</span> Test your screen sharing in advance</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button onClick={handleJoinSession}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:from-indigo-500 hover:to-violet-500 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2">
                <HiOutlineVideoCamera size={16} />
                Join Interview Session
              </button>
              <button onClick={runChecks}
                className="w-full py-3 bg-slate-800 text-slate-300 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5">
                Re-run Checks
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewLobby;
