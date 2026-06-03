import { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { 
  HiOutlinePaperAirplane, HiOutlineChatAlt2, HiOutlineUserCircle, 
  HiOutlineDotsVertical, HiOutlinePlus, HiOutlineEmojiHappy, 
  HiOutlinePaperClip, HiOutlineSearch, HiOutlineViewGrid,
  HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineIdentification,
  HiOutlineTrendingUp, HiOutlineAdjustments, HiOutlineCollection, 
  HiOutlineChat, HiOutlineChevronLeft, HiOutlineLightningBolt
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const socket = useRef();
  const scrollRef = useRef();

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
    const fetchChats = async () => {
      try {
        const res = await messageAPI.getChatList();
        setChats(res.data.chats || []);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load chats');
      }
    };
    fetchChats();

    socket.current = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.current.emit('join', user._id);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user._id]);

  useEffect(() => {
    if (!socket.current) return;

    const handleNewMessage = (msg) => {
      if (activeChat?._id === msg.application) {
        setMessages(prev => [...prev, msg]);
      }
      messageAPI.getChatList().then(res => setChats(res.data.chats || []));
    };

    socket.current.on('new_message', handleNewMessage);

    return () => {
      socket.current.off('new_message', handleNewMessage);
    };
  }, [activeChat?._id]);

  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const res = await messageAPI.getMessages(activeChat._id);
          setMessages(res.data.messages);
          socket.current.emit('join_chat', activeChat._id);
        } catch (error) {
          toast.error('Failed to load messages');
        }
      };
      fetchMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const receiverId = user.role === 'CANDIDATE' ? activeChat.appDetails.recruiter : activeChat.appDetails.candidate;
      const res = await messageAPI.sendMessage({
        applicationId: activeChat._id,
        receiverId,
        content: newMessage
      });
      setMessages([...messages, res.data.message]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const filteredChats = chats.filter(chat => {
    const name = user.role === 'CANDIDATE' ? chat.jobDetails?.company : 'Candidate';
    return name?.toLowerCase().includes(searchTerm.toLowerCase()) || chat.jobDetails?.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Establishing Secure Link...</p>
       </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar links={dashboardLinks} />

      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex-1 flex overflow-hidden relative z-10">
          {/* Chat List Sidebar */}
          <div className={`w-full md:w-[400px] flex flex-col bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 transition-all ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-8 border-b border-white/5">
               <h1 className="text-3xl font-black text-white font-outfit tracking-tighter mb-6 flex items-center gap-3">
                 <HiOutlineChat className="text-primary" /> Messages
               </h1>
               <div className="relative group">
                 <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search encrypted channels..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-primary/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                 />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {filteredChats.length > 0 ? filteredChats.map((chat) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`p-6 cursor-pointer border-b border-white/5 transition-all flex gap-4 items-center group relative overflow-hidden ${activeChat?._id === chat._id ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                  >
                    {activeChat?._id === chat._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 border border-white/10 shadow-2xl ${chat._id.charCodeAt(0) % 2 === 0 ? 'bg-blue-600' : 'bg-slate-700'}`}>
                        {user.role === 'CANDIDATE' ? chat.jobDetails?.company?.[0] || 'C' : 'C'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-white font-black text-sm truncate uppercase tracking-tight">{user.role === 'CANDIDATE' ? chat.jobDetails?.company || 'Company' : 'Candidate'}</p>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-2">
                          {chat.lastMessage?.createdAt ? new Date(chat.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${activeChat?._id === chat._id ? 'text-slate-300 font-bold' : 'text-slate-500'}`}>
                        {chat.lastMessage?.content || 'Awaiting transmission...'}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest truncate">{chat.jobDetails?.title || 'System Protocol'}</p>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-12 text-center text-slate-600">
                    <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/5">
                      <HiOutlineChatAlt2 size={40} className="opacity-20" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">No Comms Found</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col bg-slate-950/20 backdrop-blur-xl relative transition-all ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
            <AnimatePresence mode="wait">
              {activeChat ? (
                <motion.div 
                  key="chat-active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col h-full"
                >
                  {/* Chat Header */}
                  <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-900/20">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setActiveChat(null)} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
                        <HiOutlineChevronLeft size={24} />
                      </button>
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl ${activeChat._id.charCodeAt(0) % 2 === 0 ? 'bg-blue-600' : 'bg-slate-700'}`}>
                          {user.role === 'CANDIDATE' ? activeChat.jobDetails?.company?.[0] || 'C' : 'C'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
                          {user.role === 'CANDIDATE' ? activeChat.jobDetails?.company || 'Company' : 'Candidate Profile'}
                          <HiOutlineLightningBolt className="text-primary text-sm" />
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Encrypted Channel • {activeChat.jobDetails?.title || 'Unknown Position'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-3 text-slate-400 hover:text-white transition-all rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10">
                          <HiOutlineDotsVertical size={20} />
                       </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-950/40">
                    {messages.length > 0 ? messages.map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                        ref={i === messages.length - 1 ? scrollRef : null}
                      >
                        <div className={`max-w-[75%] p-5 rounded-[24px] shadow-2xl relative group ${
                          msg.sender._id === user._id 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-slate-900 text-slate-200 rounded-tl-none border border-white/5'
                        }`}>
                          <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                          <div className={`flex items-center gap-2 mt-3 ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${msg.sender._id === user._id ? 'text-blue-100' : 'text-slate-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.sender._id === user._id && <div className="w-1 h-1 bg-emerald-400 rounded-full" />}
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                         <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5 border-dashed">
                           <HiOutlineSparkles size={32} className="text-primary animate-pulse" />
                         </div>
                         <h3 className="text-white font-black text-lg mb-2">Protocol Initialized</h3>
                         <p className="text-slate-500 text-xs max-w-xs font-medium">This channel is secure. Send a transmission to begin the synchronization.</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-8 bg-slate-900/20 backdrop-blur-3xl border-t border-white/5">
                    <form onSubmit={handleSendMessage} className="flex gap-4 items-center max-w-5xl mx-auto">
                      <div className="flex gap-2">
                        <button type="button" className="p-4 text-slate-500 hover:text-white transition-all rounded-2xl bg-white/5 border border-white/5 hover:border-white/10">
                          <HiOutlinePaperClip size={20}/>
                        </button>
                        <button type="button" className="hidden sm:block p-4 text-slate-500 hover:text-white transition-all rounded-2xl bg-white/5 border border-white/5 hover:border-white/10">
                          <HiOutlineEmojiHappy size={20}/>
                        </button>
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Type your transmission..."
                          className="w-full bg-slate-900 border border-white/5 rounded-[20px] px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="w-14 h-14 bg-primary text-white rounded-[20px] hover:bg-blue-500 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 disabled:grayscale flex items-center justify-center active:scale-95 shrink-0"
                      >
                        <HiOutlinePaperAirplane className="rotate-90" size={20} />
                      </button>
                    </form>
                    <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mt-4">Security Protocol: AES-256 E2E Encryption Active</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="chat-placeholder"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-20 text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                    <div className="w-32 h-32 rounded-[48px] bg-slate-900 flex items-center justify-center mb-10 relative border border-white/5 shadow-2xl">
                       <HiOutlineChatAlt2 size={64} className="text-primary/40" />
                       <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full border-4 border-slate-950 flex items-center justify-center text-white font-black text-[10px]"
                       >
                         {chats.length}
                       </motion.div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white font-outfit tracking-tighter mb-4 uppercase">Secure Terminal</h3>
                  <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed">
                    Welcome to the encrypted communication hub. Select a verified connection from the sidebar to establish a secure link.
                  </p>
                  <div className="mt-10 flex gap-4">
                     <div className="px-4 py-2 rounded-full bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full" /> System Online
                     </div>
                     <div className="px-4 py-2 rounded-full bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <HiOutlineAdjustments /> Configured
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
