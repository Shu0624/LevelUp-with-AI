import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Square, CalendarClock, Trophy, StickyNote, 
  Plus, Trash2, Rocket, PieChart as PieChartIcon, Clock, 
  Flame, History, X, Target, BrainCircuit, FileSearch, Users, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import ProgressRing from '../components/dashboard/ProgressRing';
import { useActivity, ACTIVITY_CATEGORIES } from '../context/ActivityContext';
import confetti from 'canvas-confetti';
import BinauralBeatsPlayer from '../components/dashboard/BinauralBeatsPlayer';
import TaskChecklist from '../components/dashboard/TaskChecklist';

const StudentDashboard = () => {
  const { user, api } = useAuth();
  const [progress, setProgress] = useState({ programming: 0, ai: 0, aptitude: 0 });
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [resumeScore, setResumeScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState(null);
  const [lastActiveModule, setLastActiveModule] = useState(null);
  const [moduleProgress, setModuleProgress] = useState(0);

  // Global Timer state
  const {
    timerRunning, timerSeconds, timerCategory, timerLabel,
    timerMode, countdownMinutes,
    setTimerCategory, setTimerLabel, setTimerMode, setCountdownMinutes,
    startTimer, pauseTimer, stopAndSaveTimer,
    formatTime
  } = useActivity();

  // History & Analytics
  const [activityHistory, setActivityHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Notes form
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTopic, setNoteTopic] = useState('');

  useEffect(() => {
    fetchDashboard();
    fetchNotes();
    fetchHistory();
    loadAnalyticsData();
    
    // Listen for global timer saves to refresh history
    const handleActivityLog = () => {
      fetchHistory();
      loadAnalyticsData();
    };
    window.addEventListener('activity-logged', handleActivityLog);
    return () => window.removeEventListener('activity-logged', handleActivityLog);
  }, []);

  const fetchDashboard = async () => {
    try {
      const [res, modRes, progRes] = await Promise.all([
        api.get('/dashboard/student'),
        api.get('/modules').catch(() => ({ data: [] })),
        api.get('/modules/progress').catch(() => ({ data: { modules: [] } }))
      ]);
      setProgress(res.data.progress || { programming: 0, ai: 0, aptitude: 0 });
      setEvents(res.data.events || []);
      setResumeScore(res.data.resumeScore);

      const prog = progRes.data.modules || [];
      const mods = modRes.data || [];
      // Find the first module that has progress but is not fully complete, or the last one played
      const activeProg = prog.find(p => p.completedLessons && p.completedLessons.length > 0);
      if (activeProg) {
         const matchingMod = mods.find(m => m._id === activeProg.moduleId);
         if (matchingMod) {
           const percent = Math.round((activeProg.completedLessons.length / matchingMod.lessons.length) * 100);
           if (percent < 100) {
             setLastActiveModule(matchingMod);
             setModuleProgress(percent);
           }
         }
      }
      
      const streak = res.data.streak;
      setStreakData(streak);
      if (streak && streak.current >= 7) {
        // Trigger celebration
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          });
        }, 500);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchNotes = async () => {
    try { const res = await api.get('/dashboard/notes'); setNotes(res.data || []); }
    catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    try { const res = await api.get('/activity/history'); setActivityHistory(res.data || []); }
    catch (err) { console.error(err); }
  };

  const loadAnalyticsData = async () => {
    try {
      const res = await api.get('/activity/analytics');
      setAnalytics(res.data);
    } catch (err) { console.error(err); }
  };

  const openAnalyticsModal = () => {
    setShowAnalytics(true);
  };

  const formatDuration = (s) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  };

  // Notes CRUD
  const createNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    try { 
      await api.post('/dashboard/notes', { title: noteTitle, content: noteContent, topic: noteTopic }); 
      setNoteTitle(''); setNoteContent(''); setNoteTopic(''); setShowNoteForm(false); 
      fetchNotes(); 
    }
    catch (err) { alert('Failed to save note'); }
  };
  
  const deleteNote = async (id) => { 
    try { await api.delete(`/dashboard/notes/${id}`); fetchNotes(); } 
    catch (err) { alert('Failed'); } 
  };

  const formatDate = (dateStr) => { 
    const d = new Date(dateStr); 
    return { month: d.toLocaleString('default', { month: 'short' }), day: d.getDate() }; 
  };

  // ---- CHART DATA PREP ----
  const categoryChartData = analytics?.byCategory.map(c => ({
    name: ACTIVITY_CATEGORIES.find(cat => cat.value === c._id)?.label || c._id,
    value: Math.round(c.totalSeconds / 60),
    color: ACTIVITY_CATEGORIES.find(cat => cat.value === c._id)?.color || '#6b7280'
  })) || [];

  const dailyChartData = analytics ? (() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = analytics.daily.find(r => r._id === key);
      data.push({
        name: d.toLocaleDateString('en', { weekday: 'short' }),
        minutes: found ? Math.round(found.totalSeconds / 60) : 0
      });
    }
    return data;
  })() : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Activity className="animate-pulse mb-4 text-primary" size={48} />
        <p className="animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Your career preparation command center.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={openAnalyticsModal} 
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition-colors"
          >
            <PieChartIcon size={16} /> Analytics
          </button>
          <Link 
            to="/roadmap" 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 rounded-xl text-sm font-medium transition-all"
          >
            <Rocket size={16} /> AI Roadmap
          </Link>
        </div>
      </header>

      {/* ====================== GLOBAL TIME SUMMARY ====================== */}
      {analytics && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="glass-morphism rounded-2xl p-6 border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock size={16} className="text-primary" /> Time Spent Today
              </div>
              <div className="text-4xl font-black text-foreground font-mono tracking-tighter">
                {formatDuration(analytics.today?.totalSeconds || 0)}
              </div>
              <div className="text-xs font-semibold text-muted-foreground mt-2">
                Across {analytics.today?.sessions || 0} active sessions
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary/40 hidden sm:flex">
               <Activity size={32} />
            </div>
          </div>
          <div className="glass-morphism rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <CalendarClock size={16} className="text-emerald-500" /> Last 7 Days Summary
              </div>
              <div className="text-4xl font-black text-foreground font-mono tracking-tighter">
                {formatDuration(analytics.daily?.reduce((sum, d) => sum + (d.totalSeconds || 0), 0) || 0)}
              </div>
              <div className="text-xs font-semibold text-muted-foreground mt-2">
                From {analytics.daily?.reduce((sum, d) => sum + (d.sessions || 0), 0) || 0} active sessions
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500/40 hidden sm:flex">
               <PieChartIcon size={32} />
            </div>
          </div>
        </section>
      )}

      {/* ====================== MAIN GRID ====================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">
        
          {/* Continue Learning Card */}
          {lastActiveModule && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism rounded-2xl p-6 border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Play size={28} className="translate-x-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Continue Learning</h3>
                  <h2 className="text-xl font-bold text-foreground line-clamp-1">{lastActiveModule.title}</h2>
                  <div className="flex items-center gap-3 mt-2">
                     <div className="w-32 bg-secondary h-2 rounded-full overflow-hidden">
                       <div className="bg-primary h-full transition-all" style={{ width: `${moduleProgress}%` }}></div>
                     </div>
                     <span className="text-xs font-semibold text-muted-foreground">{moduleProgress}%</span>
                  </div>
                </div>
              </div>
              
              <Link 
                to={`/modules/${lastActiveModule.slug}`}
                className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-center"
              >
                Resume Module
              </Link>
            </motion.div>
          )}

          {/* Active Study Timer */}
          <section className="glass-morphism rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-primary/5 rotate-12 pointer-events-none">
              <Clock size={200} />
            </div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-lg font-bold flex items-center gap-2"><Clock className="text-primary" size={20}/> Focus Session</h2>
              <div className="flex bg-background/50 p-1 rounded-lg border border-border/50">
                {['stopwatch', 'countdown'].map(mode => (
                  <button 
                    key={mode} 
                    onClick={() => { if (!timerRunning) setTimerMode(mode); }}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                      timerMode === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              
              {/* Timer Config */}
              <div className="flex flex-col gap-3 w-full md:w-1/3">
                <select 
                  value={timerCategory} 
                  onChange={e => setTimerCategory(e.target.value)} 
                  disabled={timerRunning}
                  className="bg-background/80 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-50"
                >
                  {ACTIVITY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input 
                  value={timerLabel} 
                  onChange={e => setTimerLabel(e.target.value)} 
                  placeholder="What are you working on?" 
                  disabled={timerRunning}
                  className="bg-background/80 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all disabled:opacity-50" 
                />
                {timerMode === 'countdown' && (
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" min="1" max="480" 
                      value={countdownMinutes} 
                      onChange={e => setCountdownMinutes(parseInt(e.target.value) || 1)} 
                      disabled={timerRunning}
                      className="w-20 bg-background/80 border border-border rounded-xl px-3 py-2 text-center text-sm focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-50" 
                    />
                    <span className="text-muted-foreground text-sm font-medium">minutes</span>
                  </div>
                )}
              </div>

              {/* Timer Display */}
              <div className="flex flex-col items-center">
                <div className={`text-6xl md:text-7xl font-light font-mono tracking-tighter tabular-nums transition-colors duration-500 ${
                  timerRunning ? 'text-primary' : 'text-foreground'
                }`}>
                  {timerMode === 'countdown' ? formatTime(Math.max((countdownMinutes * 60) - timerSeconds, 0)) : formatTime(timerSeconds)}
                </div>
                <div className="text-xs font-medium text-muted-foreground mt-2 uppercase tracking-widest">
                  {timerRunning ? `Studying ${ACTIVITY_CATEGORIES.find(c => c.value === timerCategory)?.label}` : 'Ready to start'}
                </div>
                
                <div className="flex items-center justify-center gap-4 mt-6">
                  {!timerRunning ? (
                    <button 
                      onClick={startTimer} 
                      className="w-14 h-14 rounded-full bg-success text-success-foreground shadow-lg shadow-success/20 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <Play fill="currentColor" size={20} className="ml-1" />
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={pauseTimer} 
                        className="w-12 h-12 rounded-full bg-warning text-warning-foreground shadow-md flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <Pause fill="currentColor" size={18} />
                      </button>
                      <button 
                        onClick={stopAndSaveTimer} 
                        className="w-12 h-12 rounded-full bg-destructive text-destructive-foreground shadow-md flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <Square fill="currentColor" size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Today's Summary */}
              <div className="flex md:flex-col gap-3 w-full md:w-auto">
                <div className="glass-morphism rounded-xl px-5 py-4 text-center w-full min-w-[120px]">
                  <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Today</div>
                  <div className="text-xl font-bold text-foreground">
                    {formatDuration(activityHistory.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).reduce((sum, a) => sum + a.duration, 0))}
                  </div>
                </div>
                <div className="glass-morphism rounded-xl px-5 py-4 text-center w-full min-w-[120px]">
                  <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Sessions</div>
                  <div className="text-xl font-bold text-foreground">
                    {activityHistory.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Activity History */}
          <section className="glass-morphism rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><History className="text-accent" size={20}/> Recent Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activityHistory.length === 0 ? (
                <div className="col-span-full py-6 text-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                  No sessions yet. Start the timer above!
                </div>
              ) : activityHistory.slice(0, 6).map((a, i) => {
                const cat = ACTIVITY_CATEGORIES.find(c => c.value === a.category);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="flex items-center gap-4 bg-background/50 border border-border/50 p-4 rounded-xl hover:border-border transition-colors duration-300"
                  >
                    <div className="w-1.5 h-10 rounded-full" style={{ background: cat?.color || '#6b7280' }}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate text-foreground">{a.label || cat?.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDuration(a.duration)} • {new Date(a.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Daily Task Checklist */}
          <TaskChecklist />
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          
          {/* Streak Box */}
          {streakData && (
            <section className="glass-morphism rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-background to-orange-500/5">
              <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10">
                <Flame size={120} className="text-orange-500" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shadow-inner border border-orange-500/30">
                  <Flame size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">{streakData.current} Day Streak!</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">Longest: {streakData.longest} days</p>
                </div>
              </div>
              {streakData.current >= 7 && (
                <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm font-medium text-orange-500 text-center relative z-10 animate-pulse">
                  🔥 You're on fire! Keep going! 🔥
                </div>
              )}
            </section>
          )}

          {/* Quick Actions */}
          <section className="glass-morphism rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2"><Target className="text-blue-500" size={20}/> Next Steps</h2>
            <div className="space-y-3">
              {[
                { to: '/interview', title: 'AI Mock Interview', desc: 'Practice technical questions', icon: <Users size={16} />, color: 'var(--primary)' },
                { to: '/resume', title: 'Resume Analyzer', desc: resumeScore ? `Score: ${resumeScore}/100` : 'Optimize your CV', icon: <FileSearch size={16} />, color: 'var(--accent)' },
                { to: '/modules', title: 'Learning Hub', desc: 'Continue technical modules', icon: <BrainCircuit size={16} />, color: 'var(--success)' },
              ].map((action, i) => (
                <Link 
                  key={i} 
                  to={action.to} 
                  className="group flex justify-between items-center bg-background/50 border border-border/50 p-4 rounded-xl hover:bg-secondary/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background shadow-sm border border-border text-primary group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <div>
                      <h4 className="m-0 text-sm font-semibold text-foreground">{action.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Events */}
          <section className="glass-morphism rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CalendarClock className="text-success" size={20}/> Upcoming Events</h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                  No upcoming hackathons or tests.
                </div>
              ) : events.slice(0, 4).map(event => {
                const { month, day } = formatDate(event.date);
                return (
                  <div key={event._id} className="flex flex-row items-center gap-4 bg-background/30 p-3 rounded-xl border border-transparent hover:border-border/50 transition-colors">
                    <div className="flex flex-col items-center justify-center bg-secondary w-12 h-14 rounded-lg shadow-inner">
                      <span className="text-[10px] font-bold text-primary uppercase">{month}</span>
                      <span className="text-lg font-bold leading-none text-foreground">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{event.title}</div>
                      <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 bg-background border border-border rounded-full capitalize text-muted-foreground">
                        {event.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Binaural Beats */}
          <BinauralBeatsPlayer />

        </div>
      </div>

      {/* ====================== ANALYTICS MODAL ====================== */}
      <AnimatePresence>
        {showAnalytics && analytics && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAnalytics(false); }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.15 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-y-auto glass-morphism rounded-3xl shadow-2xl p-6 md:p-10 relative"
            >
              <button 
                onClick={() => setShowAnalytics(false)} 
                className="absolute top-6 right-6 p-2 bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex justify-center items-center gap-3">
                  <PieChartIcon className="text-primary" size={28} /> Performance Analytics
                </h2>
                <p className="text-muted-foreground mt-2">Insights on your learning consistency.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                {[
                  { label: "Today's Focus", value: formatDuration(analytics.today.totalSeconds || 0), icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Monthly Time", value: formatDuration(analytics.monthly.totalSeconds || 0), icon: CalendarClock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Sessions", value: analytics.monthly.sessions || 0, icon: History, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "Day Streak", value: `${analytics.streak || 0} 🔥`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((s, i) => (
                  <div key={i} className="bg-background/60 border border-border/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
                    <div className={`p-3 rounded-xl ${s.bg} ${s.color} mb-4`}>
                      <s.icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{s.value}</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Layer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Category Pie */}
                <div className="bg-background/60 border border-border/50 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-6 flex items-baseline gap-2">Time Distribution</h3>
                  <div className="h-64">
                    {categoryChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-dashed border-border border rounded-xl">No category data logged</div>
                    )}
                  </div>
                </div>

                {/* 7-Day Trend */}
                <div className="bg-background/60 border border-border/50 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-6 flex items-baseline gap-2">7-Day Consistency</h3>
                  <div className="h-64">
                    {dailyChartData.some(d => d.minutes > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Area type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-dashed border-border border rounded-xl">No study history for the last 7 days.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Coaching Tips */}
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 text-primary/10 -translate-y-1/4 translate-x-1/4">
                  <BrainCircuit size={150} />
                </div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary relative z-10"><BrainCircuit size={20} /> AI Study Recommendations</h3>
                <ul className="space-y-3 relative z-10">
                  {analytics.byCategory.length === 0 && (
                    <li className="flex items-start gap-3"><div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-primary/50"></div><p className="text-muted-foreground font-medium text-sm">Start tracking sessions using the dashboard timer to build your profile.</p></li>
                  )}
                  {analytics.byCategory.length > 0 && !analytics.byCategory.find(c => c._id === 'dsa') && (
                    <li className="flex items-start gap-3"><div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-orange-400"></div><p className="text-foreground text-sm">We noticed zero <strong className="font-semibold">DSA Practice</strong> time recently. 60% of technical rounds test DSA. We suggest a 45-min session tomorrow.</p></li>
                  )}
                  {analytics.streak < 3 && (
                    <li className="flex items-start gap-3"><div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-blue-400"></div><p className="text-foreground text-sm">Consistency builds mastery. Try logging just <strong className="font-semibold">30 minutes everyday</strong> to build momentum.</p></li>
                  )}
                  {analytics.today.totalSeconds > 0 && (
                    <li className="flex items-start gap-3"><div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-success"></div><p className="text-foreground text-sm">Great job logging time today. Make sure to review your <Link to="/roadmap" className="text-primary hover:underline">Career Roadmap</Link> to ensure you're studying the right topics.</p></li>
                  )}
                </ul>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentDashboard;
