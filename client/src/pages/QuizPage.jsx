import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Clock, Check, ArrowLeft, X, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const QuizPage = () => {
  const { quizId: slug } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [answers, setAnswers] = useState({});
  const [violations, setViolations] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/modules/${slug}/quiz`);
        setQuiz(res.data);
        setTimeLeft(res.data.timeLimit * 60);
      } catch (err) {
        navigate('/modules');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [slug, navigate, api]);

  // Anti-Cheat
  useEffect(() => {
    if (!quiz || results) return;
    const handleVisibility = () => {
      if (document.hidden) {
        const newWarning = warnings + 1;
        setWarnings(newWarning);
        setViolations(prev => [...prev, { type: 'tab-switch', timestamp: new Date().toISOString() }]);
        alert(`⚠️ Warning ${newWarning}/${quiz.antiCheat?.tabSwitchLimit || 3}: Tab switching detected! Test may auto-submit.`);
        if (newWarning >= (quiz.antiCheat?.tabSwitchLimit || 3)) {
          submitQuiz('auto');
        }
      }
    };
    const prevent = (e) => { e.preventDefault(); setViolations(prev => [...prev, { type: 'copy-paste', timestamp: new Date().toISOString() }]); };
    
    document.addEventListener('visibilitychange', handleVisibility);
    if(quiz.antiCheat?.disableCopyPaste) {
      document.addEventListener('copy', prevent);
      document.addEventListener('paste', prevent);
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
    };
  }, [quiz, warnings, results]);

  // Timer
  useEffect(() => {
    if (!quiz || results || timeLeft <= 0) return;
    if (timeLeft <= 0) { submitQuiz('timeout'); return; }
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { submitQuiz('timeout'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, results, timeLeft]);

  // Confetti on mount of results if passed
  useEffect(() => {
    if (results && results.passed) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    }
  }, [results]);

  const handleSelect = (optionId) => {
    if (results) return;
    setAnswers({ ...answers, [quiz.questions[currentQ]._id]: optionId });
  };

  const submitQuiz = async (reason) => {
    if (submitting || results) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/modules/quiz/${quiz.quizId}/submit`, { answers, violations });
      setResults({ ...res.data, reason });
    } catch (err) {
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="animate-pulse">Loading secure environment...</p>
    </div>
  );
  if (!quiz) return null;

  // ---- RESULTS VIEW ----
  if (results) {
    const isSuccess = results.passed;
    return (
      <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 animate-fade-in relative">
        <div className="w-full max-w-4xl z-10">
          
          {/* Main Success/Fail Card */}
          <div className={`glass-morphism rounded-3xl p-10 text-center mb-8 border border-border/50 ${isSuccess ? 'shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'shadow-[0_0_50px_rgba(239,68,68,0.05)]'}`}>
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 text-white ${isSuccess ? 'bg-success shadow-lg shadow-success/30' : 'bg-destructive shadow-lg shadow-destructive/30'}`}>
              {isSuccess ? <Trophy size={48} /> : <X size={48} />}
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              {isSuccess ? 'Outstanding Work!' : 'Keep Practicing'}
            </h1>
            <p className="text-muted-foreground mb-10 text-lg">
              {results.reason === 'timeout' ? 'Time expired.' : results.reason === 'auto' ? 'Auto-submitted due to violations.' : 'Evaluation complete.'}
            </p>

            <div className="grid grid-cols-2 max-w-md mx-auto gap-4 mb-10">
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50">
                <div className={`text-5xl font-black mb-1 ${isSuccess ? 'text-success' : 'text-destructive'}`}>
                  {results.percentage}%
                </div>
                <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Final Score</div>
              </div>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50">
                <div className="text-5xl font-black mb-1 text-foreground">
                  {results.score}<span className="text-2xl text-muted-foreground">/{results.maxScore}</span>
                </div>
                <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Questions</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/modules" className="px-8 py-3 rounded-xl font-bold bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                Return to Hub
              </Link>
              <Link to="/dashboard" className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
                Analytics Dashboard
              </Link>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 ml-2">Question Breakdown</h3>
            {results.results.map((r, i) => (
              <div key={i} className={`glass-morphism rounded-2xl p-6 border-l-4 ${r.isCorrect ? 'border-success' : 'border-destructive'}`}>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <strong className="text-foreground text-lg leading-snug">Q{i + 1}: {r.text}</strong>
                  <div className="mt-1 flex-shrink-0">
                    {r.isCorrect ? <CheckCircle2 className="text-success" size={24} /> : <X className="text-destructive bg-destructive/10 rounded-full p-1" size={24} />}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-background/50 border border-border/50 rounded-xl p-4">
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block mb-1">Your Answer</span>
                    <span className={`font-medium ${r.isCorrect ? 'text-success' : 'text-destructive'}`}>{r.yourAnswer || 'Skipped'}</span>
                  </div>
                  {!r.isCorrect && (
                    <div className="bg-success/5 border border-success/10 rounded-xl p-4">
                      <span className="text-xs uppercase font-bold text-success/70 tracking-wider block mb-1">Correct Answer</span>
                      <span className="font-medium text-success">{r.correctAnswer}</span>
                    </div>
                  )}
                </div>

                {r.explanation && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3 text-sm text-foreground/80 leading-relaxed">
                    <span className="text-xl">💡</span> {r.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- THEATER MODE QUIZ ----
  const question = quiz.questions[currentQ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none">
      {/* Top HUD */}
      <div className="flex justify-between items-center p-4 md:p-6 bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to={`/modules/${slug}`} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white">
             <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-white/90 leading-none">{quiz.title}</h2>
            {warnings > 0 && (
              <div className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1 bg-rose-500/10 inline-flex px-2 py-0.5 rounded-full">
                <AlertTriangle size={12}/> Warnings: {warnings}/{quiz.antiCheat?.tabSwitchLimit || 3}
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm md:text-base font-bold transition-colors ${timeLeft < 60 ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-white'}`}>
          <Clock size={18} /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
        <div className="w-full max-w-3xl">
          
          <div className="text-emerald-400 font-bold tracking-widest text-xs uppercase mb-4 flex items-center gap-2">
            Question {currentQ + 1} of {quiz.questions.length}
            <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden ml-2">
              <div className="h-full bg-emerald-400 transition-all duration-300 ease-out" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%`}}></div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.h3 
              key={currentQ}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl md:text-3xl font-bold mb-10 leading-tight text-white/90"
            >
              {question.text}
            </motion.h3>
          </AnimatePresence>

          <div className="space-y-3">
            {question.options.map((opt, i) => {
              const isSelected = answers[question._id] === opt._id;
              const kbShortcuts = ['A', 'B', 'C', 'D'];
              
              return (
                <button 
                  key={opt._id} 
                  onClick={() => handleSelect(opt._id)}
                  className={`w-full text-left p-4 md:p-5 rounded-2xl flex items-center gap-4 transition-all duration-200 group border-2 ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-colors ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-black/50 text-white/50 group-hover:bg-white/10 group-hover:text-white'
                  }`}>
                    {kbShortcuts[i]}
                  </div>
                  <span className={`text-base md:text-lg font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="p-4 md:p-6 bg-black border-t border-white/10 flex justify-between items-center z-50">
        <button 
          onClick={() => setCurrentQ(c => Math.max(0, c - 1))} 
          disabled={currentQ === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-all"
        >
          <ArrowLeft size={18} /> Previous
        </button>
        
        {currentQ === quiz.questions.length - 1 ? (
          <button 
            onClick={() => submitQuiz('manual')} 
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all font-mono tracking-wide"
          >
            {submitting ? 'PROCESSING...' : <><Check size={18} /> SUBMIT QUIZ</>}
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQ(c => c + 1)} 
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold bg-white text-black hover:bg-gray-200 transition-all"
          >
            Next <ArrowRight size={18} />
          </button>
        )}
      </div>

    </div>
  );
};

export default QuizPage;
