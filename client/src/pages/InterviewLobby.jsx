import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Users, Send, Video, ArrowRight, RefreshCw, Briefcase, Coffee, Code2, Calculator, Mic, MicOff, Volume2, VolumeX, Languages, History, Database, Globe, Server, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageLearning from '../components/learning/LanguageLearning';

const InterviewLobby = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [mode, setMode] = useState('ai'); // 'ai' or 'peer'
  const [roomId, setRoomId] = useState('');

  // AI Chat state
  const [topic, setTopic] = useState('hr');
  const [projectDescription, setProjectDescription] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef(null);

  // Voice mode state
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [accent, setAccent] = useState('en-IN');
  const recognitionRef = useRef(null);

  // Session tracking
  const sessionStartRef = useRef(null);

  const topics = [
    { value: 'hr', label: 'Behavioral', icon: <Briefcase size={20}/>, desc: 'Focus on STAR method & leadership' },
    { value: 'java', label: 'Java Core', icon: <Coffee size={20}/>, desc: 'OOP, Collections, Multithreading' },
    { value: 'python', label: 'Python', icon: <Code2 size={20}/>, desc: 'Data structures & pythonic idioms' },
    { value: 'dsa', label: 'DSA', icon: <Calculator size={20}/>, desc: 'Algorithms & Big-O complexity' },
    { value: 'fullstack', label: 'MERN Stack', icon: <Globe size={20}/>, desc: 'React, Node, DBs & Architecture' },
    { value: 'os', label: 'Operating Systems', icon: <Server size={20}/>, desc: 'Memory, Processes, Threads' },
    { value: 'dbms', label: 'DBMS', icon: <Database size={20}/>, desc: 'ACID, Normalization, Transactions' },
    { value: 'cn', label: 'Computer Networks', icon: <Globe size={20}/>, desc: 'OSI Model, TCP/IP, Protocols' },
    { value: 'project', label: 'Project Deep Dive', icon: <Code2 size={20}/>, desc: 'Submit summary, get grilled on architecture' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatLoading]);

  const startPeerRoom = () => {
    const id = roomId.trim() || `room-${Date.now().toString(36)}`;
    navigate(`/interview/${id}`);
  };

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await api.post('/chat', { topic, message: userMsg, questionIndex, projectDescription });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.message }]);
      setQuestionIndex(res.data.nextQuestionIndex);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection interrupted. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- Voice: Text-to-Speech ---
  const speakText = (text) => {
    if (!ttsEnabled || !voiceMode) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/---/g, '').replace(/💡|🎉|🤔|🔥/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = accent;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // --- Voice: Speech-to-Text ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = accent;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      // Auto-send after transcription
      setTimeout(() => {
        setInput(prev => {
          if (prev.trim()) {
            // Trigger send with this value
            const userMsg = prev.trim();
            setInput('');
            setMessages(msgs => [...msgs, { role: 'user', text: userMsg }]);
            setChatLoading(true);
            api.post('/chat', { topic, message: userMsg, questionIndex, projectDescription })
              .then(res => {
                setMessages(msgs => [...msgs, { role: 'ai', text: res.data.message }]);
                setQuestionIndex(res.data.nextQuestionIndex);
                speakText(res.data.message);
              })
              .catch(() => {
                setMessages(msgs => [...msgs, { role: 'ai', text: 'Connection interrupted. Please try again.' }]);
              })
              .finally(() => setChatLoading(false));
          }
          return '';
        });
      }, 200);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const startChat = () => {
    setChatStarted(true);
    setMessages([]);
    setQuestionIndex(0);
    sessionStartRef.current = Date.now();
    // Auto-send greeting
    setTimeout(async () => {
      setChatLoading(true);
      try {
        const res = await api.post('/chat', { topic, message: 'Start', questionIndex: 0, projectDescription });
        setMessages([{ role: 'ai', text: res.data.message }]);
        setQuestionIndex(res.data.nextQuestionIndex);
      } catch (err) {
        setMessages([{ role: 'ai', text: 'Welcome to your mock interview. Tell me when you are ready.' }]);
      } finally {
        setChatLoading(false);
      }
    }, 500);
  };

  const resetChat = async () => {
    // Save session before resetting
    if (chatStarted && messages.length > 1 && sessionStartRef.current) {
      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const userMsgCount = messages.filter(m => m.role === 'user').length;
      try {
        await api.post('/interview/session', {
          topic,
          messagesCount: userMsgCount,
          durationSeconds,
          score: 0
        });
      } catch (e) {
        // silent fail — don't block UX
      }
    }
    setChatStarted(false);
    setMessages([]);
    setQuestionIndex(0);
    sessionStartRef.current = null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Interview Studio</h1>
        <p className="text-muted-foreground mb-4">Master your communication skills with our AI Mentor or practice live with a peer.</p>
        <Link to="/interview/history" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline transition-colors">
          <History size={16} /> View Practice History
        </Link>
      </header>

      {/* Mode Tabs */}
      <div className="flex justify-center mb-10">
        <div className="flex bg-background/50 p-1.5 rounded-2xl border border-border/50 shadow-sm backdrop-blur-md">
          {[
            { key: 'ai', label: 'AI Mock Interview', icon: <Bot size={18} /> },
            { key: 'peer', label: 'Peer Video Room', icon: <Users size={18} /> }
          ].map(m => (
            <button 
              key={m.key} 
              onClick={() => setMode(m.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                mode === m.key 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== AI INTERVIEW MODE ===== */}
      {mode === 'ai' && !chatStarted && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-morphism rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold mb-3">Select Your Domain</h2>
            <p className="text-muted-foreground mb-8">Choose a topic to begin a simulated technical or behavioral screening.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {topics.map(t => (
                <button 
                  key={t.value} 
                  onClick={() => setTopic(t.value)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                    topic === t.value 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]' 
                      : 'border-border/50 bg-background/50 hover:border-primary/50'
                  }`}
                >
                  <div className={`p-3 rounded-xl inline-flex mb-4 transition-colors ${
                    topic === t.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                  }`}>
                    {t.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{t.label}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </button>
              ))}
            </div>
            
            {topic === 'project' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 text-left"
              >
                <label className="block text-sm font-semibold mb-2 ml-1 text-foreground">Project Summary & Tech Stack</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="e.g. I built an AI resume analyzer using React for the frontend, Node.js + Express for the backend, and MongoDB for storage. The core feature parses PDF resumes, calls the LLM API..."
                  className="w-full bg-background/80 backdrop-blur-sm border border-border rounded-xl px-4 py-3 min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-inner transition-shadow"
                />
              </motion.div>
            )}

            <button 
              onClick={startChat} 
              disabled={topic === 'project' && projectDescription.trim().length < 20}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto text-lg ${topic === 'project' && projectDescription.trim().length < 20 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Bot size={22} /> Initiate Session
            </button>
          </div>
        </motion.div>
      )}

      {mode === 'ai' && chatStarted && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto h-[600px] flex flex-col glass-morphism rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative"
        >
          {/* Chat Header */}
          <div className="bg-background/80 backdrop-blur-md px-6 py-4 flex justify-between items-center z-10 border-b border-border/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shadow-lg">
                  <Bot size={24} />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-background rounded-full"></div>
              </div>
              <div>
                <h2 className="font-bold text-foreground">LevelUp AI Mentor</h2>
                <p className="text-xs text-primary font-medium tracking-wide uppercase">
                  {topics.find(t => t.value === topic)?.label} Module
                </p>
              </div>
            </div>
            <button 
              onClick={resetChat} 
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              title="End Session"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Voice Controls Bar */}
          <div className="bg-background/60 backdrop-blur-md px-6 py-2.5 flex items-center gap-3 border-b border-border/30">
            <button
              onClick={() => setVoiceMode(!voiceMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                voiceMode ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {voiceMode ? <Mic size={14} /> : <MicOff size={14} />}
              {voiceMode ? 'Voice On' : 'Voice Off'}
            </button>
            {voiceMode && (
              <>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    ttsEnabled ? 'bg-success/10 text-success border border-success/30' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  {ttsEnabled ? 'Speaker On' : 'Speaker Off'}
                </button>
                <select
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none"
                >
                  <option value="en-IN">🇮🇳 Indian English</option>
                  <option value="en-GB">🇬🇧 British English</option>
                  <option value="en-US">🇺🇸 American English</option>
                </select>
              </>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-background/30">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] px-6 py-4 text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' 
                      : 'bg-secondary/80 border border-border/50 text-foreground rounded-2xl rounded-tl-sm'
                  }`}>
                    {msg.text.split('\n').map((line, j) => {
                      if (line.startsWith('**') && line.endsWith('**')) return <p key={j} className="font-bold my-2 text-primary-foreground">{line.replace(/\*\*/g, '')}</p>;
                      if (line.startsWith('---')) return <hr key={j} className={`my-3 border-t ${msg.role==='user'?'border-white/20':'border-border'}`} />;
                      if (line === '') return <div key={j} className="h-2" />;
                      return <p key={j}>{line.replace(/\*\*/g, '')}</p>;
                    })}
                  </div>
                </motion.div>
              ))}
              
              {chatLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary/50 border border-border/50 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <span className="flex gap-1">
                      <motion.span animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-muted-foreground"></motion.span>
                      <motion.span animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-muted-foreground"></motion.span>
                      <motion.span animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-muted-foreground"></motion.span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
            <div className="relative flex items-end overflow-hidden glass-morphism rounded-2xl p-1 shadow-inner focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              {voiceMode && (
                <button
                  onClick={listening ? stopListening : startListening}
                  disabled={chatLoading}
                  className={`flex-shrink-0 m-1.5 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    listening
                      ? 'bg-destructive text-destructive-foreground animate-pulse shadow-md'
                      : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                  title={listening ? 'Stop listening' : 'Start speaking'}
                >
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
              <textarea 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder={voiceMode && listening ? '🎤 Listening...' : 'Type your response...'}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                className="w-full max-h-32 min-h-[56px] resize-none bg-transparent border-none py-4 px-5 text-[15px] focus:outline-none focus:ring-0 text-foreground" 
                rows="1"
              />
              <button 
                onClick={sendMessage} 
                disabled={chatLoading || !input.trim()}
                className={`flex-shrink-0 m-1.5 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() 
                    ? 'bg-primary text-primary-foreground shadow-md hover:scale-105' 
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Send size={18} className={input.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== PEER VIDEO MODE ===== */}
      {mode === 'peer' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="glass-morphism rounded-3xl p-10 md:p-14 text-center">
            <div className="w-24 h-24 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 relative">
               <Video size={40} />
               <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '3s' }}></div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Peer WebRTC Room</h2>
            <p className="text-muted-foreground mb-8">
              Enter an existing invitation code or instantly generate a new room to start practicing.
            </p>
            <div className="space-y-4">
              <input 
                value={roomId} 
                onChange={e => setRoomId(e.target.value)} 
                placeholder="Enter Room Code (e.g. room-7xbf)"
                className="w-full bg-background/50 border border-border rounded-xl px-5 py-4 text-center text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" 
              />
              <button 
                onClick={startPeerRoom} 
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {roomId.trim() ? 'Join Existing Room' : 'Generate New Room'} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== FOREIGN LANGUAGE LEARNING SECTION ===== */}
      <LanguageLearning />
    </div>
  );
};

export default InterviewLobby;
