import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteUser,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useJoin,
  usePublish,
  useRemoteUsers
} from 'agora-rtc-react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { interviewAPI } from '../../services/api';
import io from 'socket.io-client';


// Lazy-load the code editor with an explicit resolver that handles ALL React component shapes:
// plain function, ES6 class (also typeof==='function'), and React.forwardRef/memo objects ($$typeof).
const ReactSimpleCodeEditor = lazy(async () => {
  const mod = await import('react-simple-code-editor');

  // A value is a valid React component if it's a function OR a React special object ($$typeof)
  const isComponent = (v) =>
    typeof v === 'function' || (v !== null && typeof v === 'object' && v.$$typeof);

  const Component =
    isComponent(mod.default)          ? mod.default :          // forwardRef / class / fn
    isComponent(mod.default?.default) ? mod.default.default :  // double-nested CJS wrap
    isComponent(mod.Editor)           ? mod.Editor  :          // named export fallback
    null;

  if (!Component) {
    // Last resort: find any exported value that is a React component
    const found = Object.values(mod).find(isComponent);
    if (found) return { default: found };
    console.error('[LiveInterviewRoom] react-simple-code-editor exports:', mod);
    throw new Error('react-simple-code-editor: no valid React component found in exports');
  }
  return { default: Component };
});

import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css';
import toast from 'react-hot-toast';
import {
  HiOutlineMicrophone, HiMicrophone,
  HiOutlineVideoCamera, HiVideoCamera,
  HiOutlinePhoneMissedCall, HiOutlineCode,
  HiOutlineChatAlt2, HiOutlineShare,
  HiOutlineSparkles, HiOutlineTerminal,
  HiOutlineUser, HiOutlinePencil,
  HiOutlinePlay, HiOutlineStop,
  HiOutlineDownload, HiOutlineChevronDown,
  HiOutlineHand, HiOutlineEmojiHappy,
  HiOutlineClock, HiOutlineUserGroup,
  HiOutlineDocumentText, HiOutlineStar,
  HiOutlineCheck, HiOutlineLightningBolt,
  HiOutlineRefresh, HiOutlineBookOpen,
  HiOutlineClipboardCheck, HiOutlineBeaker,
  HiOutlinePhotograph, HiOutlineX
} from 'react-icons/hi';
import { SiZoom, SiGooglemeet } from 'react-icons/si';

// ─── Agora Client ─────────────────────────────────────────────────────────────
let client;
try {
  client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
} catch (e) {
  client = { on: () => {}, join: () => {}, leave: () => {} };
}

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

// ─── Language Config ──────────────────────────────────────────────────────────
const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', prism: 'javascript', ext: 'js', color: '#f7df1e', icon: '🟨' },
  { id: 'python',     label: 'Python',     prism: 'python',     ext: 'py', color: '#3776ab', icon: '🐍' },
  { id: 'java',       label: 'Java',       prism: 'java',       ext: 'java', color: '#ed8b00', icon: '☕' },
  { id: 'cpp',        label: 'C++',        prism: 'cpp',        ext: 'cpp', color: '#00599c', icon: '⚡' },
  { id: 'go',         label: 'Go',         prism: 'go',         ext: 'go', color: '#00add8', icon: '🐹' },
  { id: 'sql',        label: 'SQL',        prism: 'sql',        ext: 'sql', color: '#336791', icon: '🗄️' },
];

const STARTER_CODE = {
  javascript: `// 🚀 JavaScript Solution\nfunction solve(input) {\n  // Your solution here\n  \n  return result;\n}\n\nconsole.log(solve([]));`,
  python: `# 🚀 Python Solution\ndef solve(input_data):\n    # Your solution here\n    \n    return result\n\nprint(solve([]))`,
  java: `// ☕ Java Solution\npublic class Solution {\n    public static Object solve(Object[] input) {\n        // Your solution here\n        return null;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(solve(new Object[]{}));\n    }\n}`,
  cpp: `// ⚡ C++ Solution\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Your solution here\n};\n\nint main() {\n    Solution sol;\n    return 0;\n}`,
  go: `// 🐹 Go Solution\npackage main\n\nimport "fmt"\n\nfunc solve(input []int) interface{} {\n    // Your solution here\n    return nil\n}\n\nfunc main() {\n    fmt.Println(solve([]int{}))\n}`,
  sql: `-- 🗄️ SQL Solution\nSELECT *\nFROM employees\nWHERE department = 'Engineering'\nORDER BY salary DESC\nLIMIT 10;`,
};

const REACTIONS = ['👍', '👏', '🔥', '💡', '❓', '⚡', '🎯', '✅'];

const SCORECARD_CRITERIA = [
  { name: 'Problem Solving', weight: 2 },
  { name: 'Code Quality',    weight: 2 },
  { name: 'Communication',   weight: 1 },
  { name: 'Technical Depth', weight: 2 },
  { name: 'Culture Fit',     weight: 1 },
];

// ─── Timer Hook ───────────────────────────────────────────────────────────────
function useTimer(running) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return { seconds, display: `${h}:${m}:${s}` };
}

// ─── Whiteboard Component ─────────────────────────────────────────────────────
const Whiteboard = ({ roomId, userRole }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#6366f1');
  const [size, setSize] = useState(3);
  const history = useRef([]);
  const historyIndex = useRef(-1);

  const getPoint = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const draw = useCallback((ctx, from, to, strokeColor, strokeSize, erase) => {
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  useEffect(() => {
    socket.on('whiteboard_sync', (event) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (event.type === 'draw' && event.from && event.to) {
        draw(ctx, event.from, event.to, event.color, event.size, event.erase);
      }
    });
    socket.on('whiteboard_cleared', () => {
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    });
    return () => {
      socket.off('whiteboard_sync');
      socket.off('whiteboard_cleared');
    };
  }, [draw]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPoint.current = getPoint(e, canvasRef.current);
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const point = getPoint(e, canvas);
    const erase = tool === 'eraser';
    draw(ctx, lastPoint.current, point, color, erase ? 20 : size, erase);
    const event = { type: 'draw', from: lastPoint.current, to: point, color, size: erase ? 20 : size, erase };
    socket.emit('whiteboard_draw', { roomId, event });
    lastPoint.current = point;
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const clearBoard = () => {
    canvasRef.current?.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit('whiteboard_clear', { roomId });
  };

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ffffff', '#1e293b'];

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border-b border-white/5 flex-wrap">
        <div className="flex gap-1">
          {['pen','eraser'].map(t => (
            <button key={t} onClick={() => setTool(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${tool===t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {t === 'pen' ? '✏️ Pen' : '🧹 Erase'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 items-center">
          {COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen'); }}
              style={{ background: c, boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none' }}
              className="w-5 h-5 rounded-full transition-transform hover:scale-125" />
          ))}
        </div>
        <select value={size} onChange={e => setSize(Number(e.target.value))}
          className="bg-slate-800 text-slate-300 text-[10px] rounded-lg px-2 py-1 border-0 outline-none">
          {[1,2,3,5,8,12].map(s => <option key={s} value={s}>{s}px</option>)}
        </select>
        <button onClick={clearBoard} className="ml-auto text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-wider transition-colors">
          🗑️ Clear
        </button>
      </div>
      <canvas ref={canvasRef} width={1200} height={800}
        className="flex-1 w-full cursor-crosshair touch-none"
        style={{ background: '#0f172a' }}
        onMouseDown={handlePointerDown} onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}
      />
    </div>
  );
};

// ─── AI Copilot Panel ─────────────────────────────────────────────────────────
const AICopilotPanel = ({ code, language, jobTitle, analysis, analyzing, onAnalyze, onGenerateQuestion, onGenerateChallenge }) => {
  const [questions, setQuestions] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('analysis');

  const BEHAVIORAL_Qs = [
    "Tell me about a time you handled a tight deadline.",
    "Describe a conflict with a teammate and how you resolved it.",
    "What's the most complex system you've designed?",
    "How do you approach learning a new technology?",
    "Describe your biggest technical failure and lessons learned.",
    "How do you prioritize features when everything seems urgent?",
    "Tell me about a project you're most proud of.",
    "How do you handle technical debt in a fast-moving team?"
  ];

  const handleGenChallenge = async () => {
    setGenLoading(true);
    try {
      await onGenerateChallenge();
    } finally {
      setGenLoading(false);
    }
  };

  const handleGenQuestion = async (type) => {
    setGenLoading(true);
    try {
      const res = await interviewAPI.generateQuestion({ context: `Job: ${jobTitle}, Language: ${language}`, type });
      if (res.data?.question) setQuestions(prev => [res.data.question, ...prev].slice(0, 10));
    } catch {
      toast.error('Failed to generate question');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      {/* Section Tabs */}
      <div className="flex border-b border-white/5 shrink-0">
        {[
          { id: 'analysis', label: '🔬 Analysis', },
          { id: 'questions', label: '❓ Questions' },
          { id: 'behavioral', label: '🧠 Behavioral' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)}
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${activeSection === tab.id ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSection === 'analysis' && (
          <>
            <button onClick={onAnalyze} disabled={analyzing}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {analyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineSparkles size={14} />}
              {analyzing ? 'Analyzing Code...' : 'Analyze with Gemini AI'}
            </button>

            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Score card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-violet-900/60 border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Code Quality</p>
                    <span className="text-2xl font-black text-white">{analysis.rating}<span className="text-sm text-slate-400">/10</span></span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                      style={{ width: `${(analysis.rating / 10) * 100}%` }} />
                  </div>
                  {analysis.complexity && (
                    <p className="text-[9px] text-slate-400 mt-2 font-medium">Complexity: <span className="text-indigo-300">{analysis.complexity}</span></p>
                  )}
                </div>

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Strengths
                    </p>
                    <div className="space-y-1.5">
                      {analysis.strengths.map((s, i) => (
                        <div key={i} className="p-3 bg-emerald-950/40 border border-emerald-800/30 rounded-xl text-[11px] text-emerald-300">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {analysis.improvements?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Improvements
                    </p>
                    <div className="space-y-1.5">
                      {analysis.improvements.map((s, i) => (
                        <div key={i} className="p-3 bg-amber-950/40 border border-amber-800/30 rounded-xl text-[11px] text-amber-300">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verdict */}
                {analysis.verdict && (
                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">AI Verdict</p>
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{analysis.verdict}"</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-center mx-auto mb-4">
                  <HiOutlineSparkles size={24} className="text-indigo-400/40" />
                </div>
                <p className="text-xs text-slate-500">Click analyze to get AI insights on the candidate's code</p>
              </div>
            )}
          </>
        )}

        {activeSection === 'questions' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {['technical', 'coding', 'situational'].map(type => (
                <button key={type} onClick={() => handleGenQuestion(type)} disabled={genLoading}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-300 transition-all disabled:opacity-50">
                  + {type}
                </button>
              ))}
              <button onClick={handleGenChallenge} disabled={genLoading}
                className="py-2 px-3 bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider text-indigo-300 transition-all disabled:opacity-50">
                + Challenge
              </button>
            </div>
            {genLoading && (
              <div className="flex items-center gap-2 py-3 justify-center">
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-[10px] text-slate-500">Generating...</span>
              </div>
            )}
            <div className="space-y-2">
              {questions.map((q, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                  <p className="text-[10px] text-indigo-400 font-black uppercase mb-1">Q{questions.length - i}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{typeof q === 'string' ? q : q.question || JSON.stringify(q)}</p>
                </motion.div>
              ))}
              {questions.length === 0 && (
                <p className="text-center text-[11px] text-slate-600 py-6">Generate AI questions for this session</p>
              )}
            </div>
          </>
        )}

        {activeSection === 'behavioral' && (
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Behavioral Question Bank</p>
            {BEHAVIORAL_Qs.map((q, i) => (
              <div key={i} className="p-3 bg-slate-900 border border-white/5 rounded-xl group cursor-pointer hover:border-indigo-500/30 transition-all"
                onClick={() => { navigator.clipboard.writeText(q); toast.success('Copied!'); }}>
                <p className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">{q}</p>
                <p className="text-[9px] text-slate-600 mt-1 group-hover:text-indigo-400 transition-colors">Click to copy</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Chat Panel ───────────────────────────────────────────────────────────────
const ChatPanel = ({ roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    socket.on('interview_chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => socket.off('interview_chat_message');
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      senderId: user._id,
      senderName: user.name,
      senderRole: user.role,
      message: input.trim(),
      type: 'text',
      timestamp: Date.now()
    };
    socket.emit('interview_chat', { roomId, message: msg });
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <HiOutlineChatAlt2 size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-xs text-slate-600">Interview chat — messages are private to this session</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user._id || msg.senderName === user.name;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMe && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1"
                    style={{ color: msg.senderRole === 'RECRUITER' ? '#818cf8' : '#34d399' }}>
                    {msg.senderName?.split(' ')[0]} · {msg.senderRole}
                  </span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-[11px] leading-relaxed ${
                  isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-white/5'
                }`}>
                  {msg.message}
                </div>
                <span className="text-[9px] text-slate-600 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-white/5 bg-slate-900 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Message..."
          className="flex-1 bg-slate-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none border border-white/5 focus:border-indigo-500/50 placeholder-slate-600"
        />
        <button onClick={sendMessage}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors">
          Send
        </button>
      </div>
    </div>
  );
};

// ─── Scorecard Panel ──────────────────────────────────────────────────────────
const ScorecardPanel = ({ interviewId, onSubmit }) => {
  const [scores, setScores] = useState(SCORECARD_CRITERIA.map(c => ({ ...c, score: 0 })));
  const [recommendation, setRecommendation] = useState('PENDING');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const overallScore = scores.reduce((sum, c) => sum + (c.score * c.weight), 0) /
    scores.reduce((sum, c) => sum + c.weight, 0);

  const RECS = [
    { id: 'STRONG_HIRE', label: '⭐ Strong Hire', color: 'emerald' },
    { id: 'HIRE', label: '✅ Hire', color: 'green' },
    { id: 'MAYBE', label: '🤔 Maybe', color: 'amber' },
    { id: 'NO_HIRE', label: '❌ No Hire', color: 'red' },
    { id: 'STRONG_NO_HIRE', label: '🚫 Strong No', color: 'rose' },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await interviewAPI.submitScorecard(interviewId, {
        criteria: scores,
        recommendation,
        privateNotes: notes,
        sharedFeedback: feedback,
        overallRating: Math.round(overallScore * 2) / 2
      });
      toast.success('Scorecard submitted!');
      onSubmit?.();
    } catch (err) {
      console.error('Scorecard error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit scorecard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Overall */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/5 text-center">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Overall Score</p>
          <p className="text-4xl font-black text-white">{overallScore.toFixed(1)}<span className="text-slate-500 text-lg">/10</span></p>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${(overallScore / 10) * 100}%` }} />
          </div>
        </div>

        {/* Criteria */}
        <div className="space-y-3">
          {scores.map((criterion, i) => (
            <div key={criterion.name}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-slate-300">{criterion.name}</span>
                <span className="text-[10px] font-black text-indigo-400">{criterion.score}/10</span>
              </div>
              <div className="flex gap-1">
                {[...Array(10)].map((_, j) => (
                  <button key={j}
                    onClick={() => setScores(prev => prev.map((s, idx) => idx === i ? { ...s, score: j + 1 } : s))}
                    className={`flex-1 h-2 rounded-full transition-all ${j < criterion.score ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Recommendation</p>
          <div className="grid grid-cols-2 gap-1.5">
            {RECS.map(r => (
              <button key={r.id} onClick={() => setRecommendation(r.id)}
                className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                  recommendation === r.id
                    ? 'bg-indigo-600 text-white border border-indigo-500'
                    : 'bg-slate-800 text-slate-400 border border-white/5 hover:border-white/10'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Private Notes */}
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Private Notes</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            rows={3} placeholder="Internal notes (not shared with candidate)..."
            className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 outline-none focus:border-indigo-500/30 placeholder-slate-600 resize-none" />
        </div>

        {/* Shared Feedback */}
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Candidate Feedback</p>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
            rows={3} placeholder="Feedback to share with candidate..."
            className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-slate-300 outline-none focus:border-indigo-500/30 placeholder-slate-600 resize-none" />
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineClipboardCheck size={14} />}
          Submit Scorecard
        </button>
      </div>
    </div>
  );
};

// ─── Main Interview Room Content ──────────────────────────────────────────────
export const LiveInterviewRoomContent = ({ appId, channelName, token, isMock, initialSession, originalId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

  // Video state
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenTrackRef = useRef(null);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, cameraOn]);

  // Code editor state
  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState('');

  // Panel state
  const [leftPanel, setLeftPanel] = useState('CODE'); // CODE | WHITEBOARD
  const [rightPanel, setRightPanel] = useState(isRecruiter ? 'AI' : 'CHAT'); // AI | CHAT | SCORECARD | NOTES
  const [showParticipants, setShowParticipants] = useState(false);

  // Interview state
  const [timerRunning, setTimerRunning] = useState(false);
  const { display: timerDisplay } = useTimer(timerRunning);
  const [participants, setParticipants] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [handRaised, setHandRaised] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeProblem, setActiveProblem] = useState(null);
  const [interviewSession, setInterviewSession] = useState(initialSession);

  // Agora hooks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn && !isMock);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn && !isMock);
  useJoin({ appid: appId, channel: channelName, token: token || null }, !isMock && (micOn || cameraOn));
  usePublish([localMicrophoneTrack, localCameraTrack].filter(Boolean));
  const remoteUsers = useRemoteUsers();

  // ── Socket events ──────────────────────────────────────────
  useEffect(() => {
    socket.emit('join_interview_room', {
      roomId: channelName,
      userId: user?._id,
      userName: user?.name,
      userRole: user?.role
    });

    socket.on('code_sync', ({ code: c, language: l }) => {
      setCode(c);
      if (l) setLanguage(l);
    });
    socket.on('language_synced', ({ language: l }) => setLanguage(l));
    socket.on('room_participants_updated', setParticipants);
    socket.on('reaction_received', ({ reaction, userName }) => {
      const id = Date.now();
      setReactions(prev => [...prev, { id, reaction, userName }]);
      setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
    });
    socket.on('hand_raised', ({ userName }) => toast(`✋ ${userName} raised their hand`, { duration: 4000 }));
    socket.on('session_event', ({ action, data }) => {
      if (action === 'set_problem') setActiveProblem(data);
      if (action === 'start') setTimerRunning(true);
      // Recruiter ended the session — navigate candidate away to their applications
      if (action === 'end') navigate('/candidate/applications');
    });

    if (!timerRunning) {
      setTimeout(() => setTimerRunning(true), 1000);
    }

    return () => {
      socket.emit('leave_interview_room', { roomId: channelName, userId: user?._id, userName: user?.name });
      socket.off('code_sync');
      socket.off('language_synced');
      socket.off('room_participants_updated');
      socket.off('reaction_received');
      socket.off('hand_raised');
      socket.off('session_event');
    };
  }, [channelName, user]);

  // Mock camera
  useEffect(() => {
    if (isMock && cameraOn) {
      let activeStream = null;
      // Request ONLY video to be highly reliable and not fail if mic is busy/blocked.
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          activeStream = stream;
          setLocalStream(stream);
        })
        .catch(err => {
          console.error("Mock camera capture failed:", err);
          toast.error("Webcam failed. Please ensure camera permissions are allowed.");
        });

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }
      };
    } else {
      setLocalStream(null);
    }
  }, [isMock, cameraOn]);

  // ── Handlers ───────────────────────────────────────────────
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit('code_change', { roomId: channelName, code: newCode, language, userId: user?._id });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const starter = STARTER_CODE[lang] || STARTER_CODE.javascript;
    setCode(starter);
    socket.emit('language_change', { roomId: channelName, language: lang, userId: user?._id });
  };

  const handleRunCode = async () => {
    setRunning(true);
    setOutput('⏳ Executing...\n');
    try {
      const res = await interviewAPI.executeCode({ code, language, stdin });
      const { stdout, stderr, exitCode, runtime, fallback } = res.data;
      let out = '';
      if (stdout) out += stdout;
      if (stderr) out += `\n⚠️  STDERR:\n${stderr}`;
      if (!stdout && !stderr) out = '✅ Executed with no output.';
      out += `\n\n─ Exit code: ${exitCode} · Runtime: ${runtime}ms${fallback ? ' · (Local fallback)' : ''}`;
      setOutput(out);
      socket.emit('code_run_result', { roomId: channelName, result: { stdout, stderr, exitCode }, language });
    } catch (err) {
      setOutput(`❌ Execution failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await interviewAPI.analyzeCode(code, activeProblem?.title || 'Interview Problem', language);
      setAnalysis(res.data.analysis);
      setRightPanel('AI');
    } catch (err) {
      console.error('Analyze error:', err);
      toast.error(err.response?.data?.message || 'AI Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateChallenge = async () => {
    try {
      const res = await interviewAPI.generateChallenge({ context: 'Senior developer interview', difficulty: 'medium', language });
      if (res.data?.challenge) {
        setActiveProblem(res.data.challenge);
        socket.emit('session_control', { roomId: channelName, action: 'set_problem', data: res.data.challenge });
        toast.success('Problem set for candidate');
      }
    } catch {
      toast.error('Failed to generate challenge');
    }
  };

  const handleScreenShare = async () => {
    if (!isMock) {
      try {
        if (!screenSharing) {
          const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable');
          screenTrackRef.current = screenTrack;
          await client.unpublish(localCameraTrack);
          await client.publish(screenTrack);
          setScreenSharing(true);
          socket.emit('screen_share_started', { roomId: channelName, userId: user?._id });
          toast.success('Screen sharing started');
        } else {
          await client.unpublish(screenTrackRef.current);
          screenTrackRef.current.close();
          if (localCameraTrack) await client.publish(localCameraTrack);
          setScreenSharing(false);
          socket.emit('screen_share_stopped', { roomId: channelName, userId: user?._id });
        }
      } catch (err) {
        toast.error('Screen share failed: ' + err.message);
      }
    }
  };

  const sendReaction = (reaction) => {
    socket.emit('send_reaction', { roomId: channelName, reaction, userId: user?._id, userName: user?.name });
  };

  const toggleHand = () => {
    if (!handRaised) {
      socket.emit('raise_hand', { roomId: channelName, userId: user?._id, userName: user?.name });
    } else {
      socket.emit('lower_hand', { roomId: channelName, userId: user?._id });
    }
    setHandRaised(!handRaised);
  };

  const handleSaveSnapshot = async () => {
    try {
      await interviewAPI.saveSnapshot(interviewSession?._id || originalId, { code, language, label: `Snapshot ${new Date().toLocaleTimeString()}` });
      toast.success('Code snapshot saved');
    } catch {
      toast.error('Failed to save snapshot');
    }
  };

  const handleEndSession = () => {
    if (isRecruiter) {
      // Recruiter: open scorecard panel first, then they submit to truly end
      setRightPanel('SCORECARD');
      toast('📋 Please complete the scorecard before ending', { duration: 4000, icon: '📋' });
    } else {
      // Candidate: emit leave, stop tracks, and navigate to a reliable page
      socket.emit('leave_interview_room', {
        roomId: channelName,
        userId: user?._id,
        userName: user?.name
      });
      // Stop any active Agora tracks
      try { localMicrophoneTrack?.stop(); } catch (_) {}
      try { localCameraTrack?.stop(); } catch (_) {}
      // Stop mock webcam stream
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      navigate('/candidate/applications', { replace: true });
    }
  };

  // ── Prism highlight ────────────────────────────────────────
  const highlight = (code) => {
    const lang = LANGUAGES.find(l => l.id === language);
    const prismLang = Prism.languages[lang?.prism] || Prism.languages.javascript;
    return Prism.highlight(code, prismLang, lang?.prism || 'javascript');
  };

  const langConfig = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-white font-sans">

      {/* ── Floating Reactions ──────────────────────────────── */}
      <AnimatePresence>
        {reactions.map(r => (
          <motion.div key={r.id}
            initial={{ opacity: 1, scale: 0.5, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, y: -120 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed bottom-24 right-8 text-4xl pointer-events-none z-50">
            {r.reaction}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="h-14 bg-slate-900 border-b border-white/5 flex items-center px-4 gap-4 shrink-0 z-20">
        {/* Left — branding + status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIVE</span>
          </div>
          <div className="h-5 w-px bg-white/10" />
          <h1 className="text-sm font-bold text-white hidden md:block">Interview Session</h1>
          {isMock && (
            <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
              Demo Mode
            </span>
          )}
        </div>

        {/* Center — Timer */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 bg-slate-800 border border-white/5 px-4 py-1.5 rounded-full">
            <HiOutlineClock size={12} className="text-slate-400" />
            <span className="font-mono text-sm font-bold text-white tracking-widest">{timerDisplay}</span>
          </div>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-2">
          {/* Reactions */}
          <div className="hidden md:flex items-center gap-1">
            {REACTIONS.map(r => (
              <button key={r} onClick={() => sendReaction(r)}
                className="text-base hover:scale-125 transition-transform" title="Send reaction">
                {r}
              </button>
            ))}
          </div>

          {/* Hand raise */}
          <button onClick={toggleHand}
            className={`p-2 rounded-xl text-sm transition-all ${handRaised ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            title="Raise hand">
            ✋
          </button>

          {/* Participants */}
          <button onClick={() => setShowParticipants(!showParticipants)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${showParticipants ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <HiOutlineUserGroup size={14} />
            <span>{isMock ? 2 : participants.length || 1}</span>
          </button>

          {/* End Session */}
          <button onClick={handleEndSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20">
            <HiOutlinePhoneMissedCall size={14} />
            <span className="hidden sm:block">End</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Column: Video + Active Problem ─────────────── */}
        <div className="w-72 xl:w-80 bg-slate-900 border-r border-white/5 flex flex-col shrink-0">

          {/* Video feeds */}
          <div className="flex-1 flex flex-col gap-2 p-3 overflow-hidden">
            {/* Local video */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-white/5" style={{ aspectRatio: '16/9' }}>
              {!isMock && cameraOn && localCameraTrack ? (
                <LocalVideoTrack track={localCameraTrack} play className="w-full h-full object-cover" />
              ) : isMock && cameraOn ? (
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <span className="text-lg font-black text-indigo-400">{user?.name?.[0]}</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-bold text-white">{user?.name?.split(' ')[0]} (You)</span>
              </div>
              {screenSharing && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Sharing
                </div>
              )}
            </div>

            {/* Remote video(s) */}
            {!isMock ? remoteUsers.map(ru => (
              <div key={ru.uid} className="relative rounded-2xl overflow-hidden bg-slate-800 border border-white/5" style={{ aspectRatio: '16/9' }}>
                <RemoteUser user={ru} playVideo playAudio className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <span className="text-[9px] font-bold text-white">{isRecruiter ? 'Candidate' : 'Interviewer'}</span>
                </div>
              </div>
            )) : (
              <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-white/5 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-2">
                    <HiOutlineUser size={20} className="text-violet-400" />
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium">{isRecruiter ? 'Candidate' : 'Interviewer'}</p>
                  <p className="text-[8px] text-slate-600">Awaiting connection...</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="p-3 border-t border-white/5 flex items-center justify-center gap-2">
            <button onClick={() => setMicOn(!micOn)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${micOn ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {micOn ? <HiOutlineMicrophone size={16} /> : <HiMicrophone size={16} />}
            </button>
            <button onClick={() => setCameraOn(!cameraOn)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${cameraOn ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {cameraOn ? <HiOutlineVideoCamera size={16} /> : <HiVideoCamera size={16} />}
            </button>
            <button onClick={handleScreenShare}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${screenSharing ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              title="Share screen">
              <HiOutlineShare size={16} />
            </button>
            <button onClick={handleSaveSnapshot}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
              title="Save code snapshot">
              <HiOutlineDownload size={16} />
            </button>
          </div>

          {/* Active Problem */}
          {activeProblem && (
            <div className="p-3 border-t border-white/5 max-h-52 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineBeaker size={12} className="text-violet-400" />
                <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Active Problem</p>
                <span className={`ml-auto text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${
                  activeProblem.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                  activeProblem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>{activeProblem.difficulty}</span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{activeProblem.title}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">{activeProblem.description}</p>
              {activeProblem.examples?.[0] && (
                <div className="mt-2 p-2 bg-slate-800 rounded-lg">
                  <p className="text-[9px] text-slate-500 mb-1">Example:</p>
                  <p className="text-[10px] font-mono text-emerald-400">In: {activeProblem.examples[0].input}</p>
                  <p className="text-[10px] font-mono text-blue-400">Out: {activeProblem.examples[0].output}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Center: Code Editor / Whiteboard ─────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Panel switcher */}
          <div className="flex items-center bg-slate-900 border-b border-white/5 px-4 shrink-0">
            <div className="flex">
              {[
                { id: 'CODE', icon: <HiOutlineCode size={13} />, label: 'Editor' },
                { id: 'WHITEBOARD', icon: <HiOutlinePencil size={13} />, label: 'Whiteboard' },
              ].map(p => (
                <button key={p.id} onClick={() => setLeftPanel(p.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    leftPanel === p.id ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  {p.icon}{p.label}
                </button>
              ))}
            </div>

            {/* Language selector (only in CODE mode) */}
            {leftPanel === 'CODE' && (
              <div className="ml-auto flex items-center gap-2">
                <select value={language} onChange={e => handleLanguageChange(e.target.value)}
                  className="bg-slate-800 border border-white/5 text-slate-300 text-[10px] font-bold rounded-lg px-3 py-1.5 outline-none appearance-none cursor-pointer hover:border-white/10 transition-all">
                  {LANGUAGES.map(l => (
                    <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Editor */}
          {leftPanel === 'CODE' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Code area */}
              <div className="flex-1 overflow-auto bg-[#0d1117]">
                <div className="flex min-h-full">
                  {/* Line numbers */}
                  <div className="select-none text-right pr-4 pl-4 py-5 text-slate-600 font-mono text-[12px] leading-6 bg-[#0d1117] border-r border-white/5 min-w-[3.5rem]">
                    {code.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* Editor — wrapped in Suspense because ReactSimpleCodeEditor is lazy-loaded */}
                  <div className="flex-1 py-5 pl-4">
                    <Suspense fallback={
                      <textarea
                        value={code}
                        onChange={e => handleCodeChange(e.target.value)}
                        className="w-full h-full bg-transparent text-slate-200 font-mono text-[13px] resize-none outline-none leading-6 p-0"
                        spellCheck={false}
                      />
                    }>
                      <ReactSimpleCodeEditor
                        value={code}
                        onValueChange={handleCodeChange}
                        highlight={highlight}
                        padding={0}
                        style={{ fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: 13, lineHeight: '24px', color: '#e2e8f0', background: 'transparent', minHeight: '100%' }}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>

              {/* Console */}
              <div className="h-36 bg-[#0a0e1a] border-t border-white/5 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <HiOutlineTerminal size={12} className="text-slate-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Console</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input value={stdin} onChange={e => setStdin(e.target.value)}
                      placeholder="stdin input..."
                      className="bg-slate-800 text-[10px] text-slate-400 px-3 py-1 rounded-lg border border-white/5 outline-none w-40 placeholder-slate-600" />
                    <button onClick={handleRunCode} disabled={running}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        running ? 'bg-slate-700 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      }`}>
                      {running ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <HiOutlinePlay size={12} />}
                      {running ? 'Running...' : 'Run'}
                    </button>
                    {isRecruiter && (
                      <button onClick={handleAnalyze} disabled={analyzing}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
                        {analyzing ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <HiOutlineSparkles size={12} />}
                        AI
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2">
                  <pre className={`text-[11px] font-mono leading-relaxed whitespace-pre-wrap ${
                    output.includes('Error') || output.includes('STDERR') ? 'text-red-400' :
                    output.includes('✅') ? 'text-emerald-400' : 'text-slate-300'
                  }`}>{output || '$ Ready to execute...'}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Whiteboard */}
          {leftPanel === 'WHITEBOARD' && (
            <div className="flex-1 overflow-hidden">
              <Whiteboard roomId={channelName} userRole={user?.role} />
            </div>
          )}
        </div>

        {/* ── Right Column: AI / Chat / Scorecard ──────────────── */}
        <div className="w-72 xl:w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0">
          {/* Tab bar */}
          <div className="flex border-b border-white/5 shrink-0">
            {[
              { id: 'AI', icon: '🤖', label: 'Copilot', recruiterOnly: false },
              { id: 'CHAT', icon: '💬', label: 'Chat', recruiterOnly: false },
              ...(isRecruiter ? [{ id: 'SCORECARD', icon: '📋', label: 'Score', recruiterOnly: true }] : []),
              { id: 'NOTES', icon: '📝', label: 'Notes', recruiterOnly: false },
            ].map(tab => (
              <button key={tab.id} onClick={() => setRightPanel(tab.id)}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-0.5 ${
                  rightPanel === tab.id ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {rightPanel === 'AI' && (
              <AICopilotPanel
                code={code} language={language} jobTitle={activeProblem?.title || 'Software Engineer'}
                analysis={analysis} analyzing={analyzing}
                onAnalyze={handleAnalyze}
                onGenerateQuestion={() => {}}
                onGenerateChallenge={handleGenerateChallenge}
              />
            )}
            {rightPanel === 'CHAT' && <ChatPanel roomId={channelName} user={user} />}
            {rightPanel === 'SCORECARD' && isRecruiter && (
              <ScorecardPanel interviewId={interviewSession?._id || originalId} onSubmit={() => navigate(-1)} />
            )}
            {rightPanel === 'NOTES' && (
              <div className="flex-1 flex flex-col p-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Private Notes</p>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Take notes during the interview..."
                  className="flex-1 bg-slate-950 border border-white/5 rounded-xl p-4 text-[11px] text-slate-300 outline-none focus:border-indigo-500/30 placeholder-slate-700 resize-none leading-relaxed font-mono"
                />
                <p className="text-[9px] text-slate-600 mt-2">Notes are local to your session</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-14 bottom-0 w-64 bg-slate-900 border-l border-white/5 z-30 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participants</p>
                <button onClick={() => setShowParticipants(false)} className="text-slate-600 hover:text-white">
                  <HiOutlineX size={16} />
                </button>
              </div>
              {(participants.length > 0 ? participants : [
                { userName: user?.name, userRole: user?.role, userId: user?._id }
              ]).map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${p.userRole === 'RECRUITER' ? 'bg-indigo-600/30 text-indigo-400' : 'bg-emerald-600/30 text-emerald-400'}`}>
                    {p.userName?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{p.userName}</p>
                    <p className="text-[9px] text-slate-500 font-medium">{p.userRole}</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Wrapper with Agora Provider ──────────────────────────────────────────────
const LiveInterviewRoom = () => {
  const { id } = useParams();
  const [token, setToken] = useState(null);
  const [channelName, setChannelName] = useState(id);
  const [sessionData, setSessionData] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const appId = import.meta.env.VITE_AGORA_APP_ID;
  const isMock = !appId || appId === 'placeholder' || appId === '';

  useEffect(() => {
    const initializeSession = async () => {
      let activeChannel = id;
      try {
        // First try to resolve the full session (id could be application._id or interview._id)
        const sessionRes = await interviewAPI.getSession(id);
        if (sessionRes.data?.interview) {
          setSessionData(sessionRes.data.interview);
          if (sessionRes.data.interview.agoraChannel) {
            activeChannel = sessionRes.data.interview.agoraChannel;
          }
        }
      } catch (err) {
        console.warn('Session fetch failed, falling back to id as channel', err);
      }
      
      setChannelName(activeChannel);

      if (isMock) { 
        setLoadingToken(false); 
        return; 
      }
      
      try {
        const res = await interviewAPI.getToken(activeChannel);
        setToken(res.data.token);
      } catch (err) {
        console.error('Token fetch failed', err);
      } finally {
        setLoadingToken(false);
      }
    };
    
    initializeSession();
  }, [id, isMock]);

  if (loadingToken) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <HiOutlineVideoCamera size={32} className="text-indigo-400" />
          </div>
          <div className="absolute -inset-2 rounded-[28px] border-2 border-indigo-500/20 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Initializing Interview Session</p>
          <div className="flex items-center gap-1 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AgoraRTCProvider client={client}>
      <LiveInterviewRoomContent appId={appId} channelName={channelName} token={token} isMock={isMock} initialSession={sessionData} originalId={id} />
    </AgoraRTCProvider>
  );
};

export default LiveInterviewRoom;
