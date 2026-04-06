import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, CalendarDays, TrendingUp, CheckCircle2, AlertTriangle, ChevronRight, Loader2, RotateCcw, Zap, Target, BookOpen, FileText } from 'lucide-react';

const Roadmap = () => {
  const { api } = useAuth();
  const [targetRole, setTargetRole] = useState('');
  const [targetMonths, setTargetMonths] = useState(3);
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [specificGoals, setSpecificGoals] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [resumeScore, setResumeScore] = useState(null);

  // Auto-fetch resume skills on mount
  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const res = await api.get('/resume/history');
        if (res.data.current) {
          setResumeSkills(res.data.current.skills || []);
          setResumeScore(res.data.current.score || null);
        }
      } catch (e) {
        // No resume yet — fine
      }
    };
    fetchResumeData();
  }, [api]);

  const generatePlan = async () => {
    if (!targetRole.trim()) {
      return alert('Please type a Target Role (e.g. Frontend Developer, DevOps Engineer) to continue.');
    }
    setLoading(true);
    try {
      const res = await api.post('/ai/roadmap', { targetRole, targetMonths, experienceLevel, specificGoals });
      setRoadmap(res.data.roadmap);
    } catch (err) {
      alert('Failed to generate roadmap. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const priorityConfig = {
    HIGH: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: <Zap size={16} /> },
    MEDIUM: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', icon: <Target size={16} /> },
    CRITICAL: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: <AlertTriangle size={16} /> }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      {/* Background */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <header className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
          <Rocket size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">AI Career Roadmap</h1>
        <p className="text-muted-foreground">
          Get a personalized study plan generated from your resume analysis, goals, and target role.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {!roadmap ? (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-morphism rounded-3xl p-8 md:p-10">
              <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Configure Your Plan</h2>

              {/* Role Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wider">What is your Target Role?</label>
                <input 
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior iOS Engineer, AI Architect, Product Manager"
                  className="w-full bg-background/50 glass-morphism border border-border/80 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                />
              </div>

              {/* Experience & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wider">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-background/50 border border-border/80 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium appearance-none"
                  >
                    <option value="Beginner">Beginner (0-1 years)</option>
                    <option value="Intermediate">Intermediate (1-3 years)</option>
                    <option value="Advanced">Advanced (3-5+ years)</option>
                    <option value="Professional">Professional (5+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wider">Timeline</label>
                  <div className="flex gap-2">
                    {[3, 6, 12].map(m => (
                      <button
                        key={m}
                        onClick={() => setTargetMonths(m)}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${
                          targetMonths === m
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border/50 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }`}
                      >
                        {m} Mo
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specific Goals */}
              <div className="mb-8">
                <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wider">Specific Goals or Focus Areas (Optional)</label>
                <textarea 
                  value={specificGoals}
                  onChange={(e) => setSpecificGoals(e.target.value)}
                  placeholder="e.g. I already know Python but want to master System Design. I want to pass FAANG interviews."
                  className="w-full h-24 resize-none bg-background/50 glass-morphism border border-border/80 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                />
              </div>

              {/* Resume Skills (auto-detected) */}
              {resumeSkills.length > 0 && (
                <div className="mb-8">
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wider">
                    Skills from Your Resume
                    {resumeScore && <span className="ml-2 text-primary">(ATS Score: {resumeScore}/100)</span>}
                  </label>
                  <div className="flex flex-wrap gap-2 p-4 bg-success/5 border border-success/20 rounded-2xl">
                    {resumeSkills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <FileText size={12} /> These skills were detected from your uploaded resume and will feed into your roadmap.
                  </p>
                </div>
              )}
              {resumeSkills.length === 0 && (
                <div className="mb-8 p-4 bg-secondary/50 border border-border/50 rounded-2xl">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    Upload a resume on the <a href="/resume" className="text-primary font-medium hover:underline">Resume Analyzer</a> page to auto-detect your skills for a more accurate roadmap.
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generatePlan}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={22} /> Generating...</>
                ) : (
                  <><Rocket size={22} /> Generate My Roadmap</>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Gap Analysis */}
            <div className="glass-morphism rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <TrendingUp className="text-primary" size={22} /> Gap Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Strengths */}
                <div className="bg-success/5 border border-success/20 rounded-2xl p-5">
                  <h4 className="font-bold text-success flex items-center gap-2 mb-3 text-sm">
                    <CheckCircle2 size={16} /> Your Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.gapAnalysis.currentStrengths.length > 0
                      ? roadmap.gapAnalysis.currentStrengths.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-xs font-medium">
                            {s}
                          </span>
                        ))
                      : <span className="text-muted-foreground text-sm">Upload a resume to detect skills</span>
                    }
                  </div>
                </div>

                {/* Skills to Learn */}
                <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5">
                  <h4 className="font-bold text-warning flex items-center gap-2 mb-3 text-sm">
                    <AlertTriangle size={16} /> Skills to Learn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.gapAnalysis.skillsToLearn.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-warning/10 text-warning border border-warning/20 rounded-lg text-xs font-medium">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Readiness */}
                <div className="flex items-center justify-center bg-background/50 border border-border/50 rounded-2xl p-5">
                  <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Readiness</div>
                    <div className={`text-xl font-extrabold ${
                      roadmap.gapAnalysis.estimatedReadiness === 'On Track' ? 'text-success' : 'text-warning'
                    }`}>
                      {roadmap.gapAnalysis.estimatedReadiness}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phases */}
            <div className="space-y-4">
              {roadmap.phases.map((phase, i) => {
                const config = priorityConfig[phase.priority] || priorityConfig.MEDIUM;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`glass-morphism rounded-2xl p-6 md:p-8 border-l-4 ${config.border}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <BookOpen size={18} className="text-primary" />
                        Phase {i + 1}: {phase.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${config.bg} ${config.color} flex items-center gap-1.5`}>
                          {config.icon} {phase.priority}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                          {phase.months}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {phase.tasks.map((task, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-foreground">
                          <ChevronRight size={16} className="text-primary mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>

            {/* Weekly Plan */}
            <div className="glass-morphism rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                <CalendarDays className="text-accent" size={22} /> Suggested Weekly Plan
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {Object.entries(roadmap.weeklyPlan).map(([day, activity]) => (
                  <div key={day} className="bg-background/50 border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="font-bold text-primary text-sm capitalize mb-2">{day}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{activity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => setRoadmap(null)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors mx-auto"
            >
              <RotateCcw size={16} /> Generate New Roadmap
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roadmap;
